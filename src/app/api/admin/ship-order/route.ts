import { NextResponse } from "next/server";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { cookies } from "next/headers";
import { timingSafeEqual } from "crypto";
import { getDb, ensureSchema } from "@/lib/db";
import { sendShippingUpdate } from "@/lib/resend";

export const runtime = "nodejs";

function safeEq(a: string, b: string) {
  const A = Buffer.from(a), B = Buffer.from(b);
  return A.length === B.length && timingSafeEqual(A, B);
}

async function isAuthed() {
  const store = await cookies();
  const cookie = store.get("lg_admin")?.value;
  const expected = process.env.ADMIN_PASSWORD;
  if (!cookie || !expected) return false;
  return safeEq(cookie, expected);
}

export async function POST(req: Request) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }
  const allowed = await rateLimit(`ship-order:${clientIp(req)}`, 30, 60);
  if (!allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  const { orderId, trackingNumber, carrier, trackingUrl } = await req.json().catch(() => ({}));
  if (!orderId || typeof orderId !== "string") {
    return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
  }

  await ensureSchema();
  const db = getDb();
  const result = await db.execute({ sql: `SELECT * FROM orders WHERE id = ?`, args: [orderId] });
  const order = result.rows[0];
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  await db.execute({
    sql: `UPDATE orders SET status = 'shipped', tracking_number = ?, tracking_carrier = ?, shipped_at = unixepoch() WHERE id = ?`,
    args: [trackingNumber ?? null, carrier ?? null, orderId],
  });

  try {
    const items = JSON.parse(order.items_json as string);
    await sendShippingUpdate({
      to: order.email as string,
      name: order.name as string,
      orderId,
      items,
      trackingNumber: trackingNumber || undefined,
      trackingUrl: trackingUrl || undefined,
      carrier: carrier || undefined,
    });
  } catch (e) {
    console.error("shipping email failed", e);
    // Order is still marked shipped even if the email hiccups — status update
    // is the source of truth, not the notification.
  }

  return NextResponse.json({ ok: true });
}
