import { NextResponse } from "next/server";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { isAuthed } from "@/lib/admin-auth";
import { getDb, ensureSchema } from "@/lib/db";
import { buyLabel, easypostConfigured, EasyPostNotConfigured } from "@/lib/easypost";

export const runtime = "nodejs";

// Buys a USPS label through EasyPost for one order and saves the label +
// tracking on it. Does NOT mark the order shipped or email the customer —
// that stays the existing "Mark Shipped + Email" step, now pre-filled
// with this tracking number.
export async function POST(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  if (!(await rateLimit(`create-label:${clientIp(req)}`, 20, 60))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  const { orderId, weightOz } = await req.json().catch(() => ({}));
  if (!orderId || typeof orderId !== "string") {
    return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
  }
  if (!easypostConfigured()) {
    return NextResponse.json({ error: new EasyPostNotConfigured().message, notConfigured: true }, { status: 501 });
  }

  await ensureSchema();
  const db = getDb();
  const r = await db.execute({ sql: `SELECT * FROM orders WHERE id = ?`, args: [orderId] });
  const o = r.rows[0];
  if (!o) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (o.label_url) {
    return NextResponse.json({ error: "This order already has a label." }, { status: 409 });
  }

  try {
    const items = JSON.parse(o.items_json as string);
    const label = await buyLabel({
      to: {
        name: o.name as string,
        street1: o.address as string,
        city: o.city as string,
        state: o.state as string,
        zip: o.zip as string,
        email: o.email as string,
      },
      items,
      weightOz: typeof weightOz === "number" ? weightOz : undefined,
    });
    await db.execute({
      sql: `UPDATE orders SET label_url = ?, label_cost = ?, tracking_number = ?, tracking_carrier = ?, tracking_url = ? WHERE id = ?`,
      args: [label.labelUrl, label.rate, label.trackingCode, label.carrier, label.trackingUrl, orderId],
    });
    return NextResponse.json({ ok: true, ...label });
  } catch (e) {
    console.error("create-label failed", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Label failed" }, { status: 502 });
  }
}
