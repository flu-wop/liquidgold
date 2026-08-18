import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getDb, ensureSchema } from "@/lib/db";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { sendContactNotification } from "@/lib/resend";

export const runtime = "nodejs";

const REASONS = ["Order Help", "General Questions", "Wholesale", "Collaborations/Partnerships", "Events", "Press/Content"];

function isValidEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) && s.length <= 200;
}

export async function POST(req: Request) {
  const allowed = await rateLimit(`contact:${clientIp(req)}`, 5, 600); // 5 per 10 min
  if (!allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  let body: { reason?: string; name?: string; email?: string; message?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { reason, name, email, message } = body;
  if (!reason || !REASONS.includes(reason)) {
    return NextResponse.json({ error: "Invalid reason" }, { status: 400 });
  }
  if (!name || name.length > 100) return NextResponse.json({ error: "Invalid name" }, { status: 400 });
  if (!email || !isValidEmail(email)) return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  if (!message || message.length < 1 || message.length > 2000) {
    return NextResponse.json({ error: "Message must be under 2000 characters" }, { status: 400 });
  }

  try {
    await ensureSchema();
    await getDb().execute({
      sql: `INSERT INTO contact_messages (id, reason, name, email, message) VALUES (?, ?, ?, ?, ?)`,
      args: [randomUUID(), reason, name, email, message],
    });
  } catch (e) {
    console.error("contact DB write failed", e);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }

  try {
    await sendContactNotification({ reason, name, email, message });
  } catch (e) {
    console.error("contact notification email failed", e);
  }

  return NextResponse.json({ ok: true });
}
