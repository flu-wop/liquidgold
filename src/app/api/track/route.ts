import { NextResponse } from "next/server";
import { getDb, ensureSchema } from "@/lib/db";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

// Allowlist — never let the client log an arbitrary event_type string.
const ALLOWED_EVENTS = new Set([
  "view_item",
  "add_to_cart",
  "checkout_started",
  "purchase",
  "quiz_started",
  "quiz_completed",
]);

export async function POST(req: Request) {
  // Generous limit — this fires on routine browsing (view_item, add_to_cart),
  // not just form submits, so it needs more headroom than contact/wholesale.
  const allowed = await rateLimit(`track:${clientIp(req)}`, 60, 60); // 60 per minute
  if (!allowed) return NextResponse.json({ ok: false }, { status: 429 });

  let body: { sessionId?: string; eventType?: string; data?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const { sessionId, eventType, data } = body;
  if (!sessionId || typeof sessionId !== "string" || sessionId.length > 100) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (!eventType || !ALLOWED_EVENTS.has(eventType)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  let dataJson: string | null = null;
  if (data !== undefined) {
    try {
      dataJson = JSON.stringify(data).slice(0, 2000); // cap payload size
    } catch {
      dataJson = null;
    }
  }

  try {
    await ensureSchema();
    await getDb().execute({
      sql: `INSERT INTO funnel_events (session_id, event_type, data_json) VALUES (?, ?, ?)`,
      args: [sessionId, eventType, dataJson],
    });
  } catch (e) {
    // Analytics logging must never surface an error to the shopper —
    // fail silently, same posture as the rate limiter.
    console.error("track insert failed", e);
  }

  return NextResponse.json({ ok: true });
}
