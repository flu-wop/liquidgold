import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { getDb, ensureSchema } from "@/lib/db";

export const runtime = "nodejs";

// Square signs: HMAC-SHA256(webhook_signature_key, notification_url + raw_body), base64-encoded.
function verifySquareSignature(rawBody: string, signature: string, url: string): boolean {
  const key = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY!;
  const expected = createHmac("sha256", key).update(url + rawBody).digest("base64");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(req: Request) {
  const raw = await req.text(); // RAW body — must verify before parsing
  const signature = req.headers.get("x-square-hmacsha256-signature");
  const url = process.env.NEXT_PUBLIC_SITE_URL + "/api/square/webhook";

  if (!signature || !verifySquareSignature(raw, signature, url)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(raw);

  if (event.type === "payment.updated") {
    const payment = event.data?.object?.payment;
    if (payment?.id && payment.status === "COMPLETED") {
      // IDEMPOTENT: only updates status if the row exists and isn't already
      // marked paid — the checkout route already inserted this order with
      // status 'paid' on the happy path, so this mostly matters for
      // payments Square reports after the fact (e.g. delayed capture).
      await ensureSchema();
      const db = getDb();
      await db.execute({
        sql: `UPDATE orders SET status = 'paid' WHERE square_payment_id = ? AND status != 'paid'`,
        args: [payment.id],
      });
    }
  }

  return NextResponse.json({ ok: true });
}
