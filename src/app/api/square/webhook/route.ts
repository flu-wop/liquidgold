import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { getDb, ensureSchema } from "@/lib/db";
import { getResend } from "@/lib/resend";

export const runtime = "nodejs";

// Square signs: HMAC-SHA256(webhook_signature_key, notification_url + raw_body), base64-encoded.
function verifySquareSignature(rawBody: string, signature: string, url: string): boolean {
  const key = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY!;
  const expected = createHmac("sha256", key).update(url + rawBody).digest("base64");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}

async function alertAriel(subject: string, text: string) {
  try {
    await getResend().emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: process.env.RESEND_TO_EMAIL!,
      subject,
      text,
    });
  } catch (e) {
    console.error("webhook alert email failed", e);
  }
}

export async function POST(req: Request) {
  const raw = await req.text(); // RAW body — must verify before parsing
  const signature = req.headers.get("x-square-hmacsha256-signature");
  const url = process.env.NEXT_PUBLIC_SITE_URL + "/api/square/webhook";

  if (!signature || !verifySquareSignature(raw, signature, url)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(raw);
  await ensureSchema();
  const db = getDb();

  // All Square event types land on this same endpoint, distinguished by
  // event.type — payment confirmation, refunds, and disputes all route
  // through here rather than needing separate webhook URLs.

  if (event.type === "payment.updated") {
    const payment = event.data?.object?.payment;
    if (payment?.id && payment.status === "COMPLETED") {
      // IDEMPOTENT: only updates status if the row exists and isn't already
      // marked paid — the checkout route already inserted this order with
      // status 'paid' on the happy path, so this mostly matters for
      // payments Square reports after the fact (e.g. delayed capture).
      await db.execute({
        sql: `UPDATE orders SET status = 'paid' WHERE square_payment_id = ? AND status != 'paid'`,
        args: [payment.id],
      });
    }
  }

  if (event.type === "refund.updated") {
    const refund = event.data?.object?.refund;
    if (refund?.payment_id && refund.status === "COMPLETED") {
      const r = await db.execute({
        sql: `UPDATE orders SET status = 'refunded' WHERE square_payment_id = ? AND status != 'refunded'`,
        args: [refund.payment_id],
      });
      // Refunds need a human to know — this isn't something to silently
      // record and move on from, per the site-audit rule on silent
      // failure paths (applies to any state change that needs eyes on it,
      // not just failures).
      if (r.rowsAffected > 0) {
        await alertAriel(
          `Refund processed — payment ${refund.payment_id}`,
          `A refund was completed in Square for payment ${refund.payment_id} (refund ${refund.id}). The matching order has been marked 'refunded' in the admin dashboard.`
        );
      }
    }
  }

  if (event.type === "dispute.created" || event.type === "dispute.state.updated") {
    const dispute = event.data?.object?.dispute;
    if (dispute?.id) {
      if (dispute.disputed_payment?.payment_id) {
        await db.execute({
          sql: `UPDATE orders SET status = 'disputed' WHERE square_payment_id = ? AND status != 'refunded'`,
          args: [dispute.disputed_payment.payment_id],
        });
      }
      await alertAriel(
        `⚠️ Payment dispute — ${dispute.id}`,
        `A customer has disputed a charge in Square.\n\nDispute ID: ${dispute.id}\nReason: ${dispute.reason ?? "not provided"}\nState: ${dispute.state ?? "unknown"}\nPayment ID: ${dispute.disputed_payment?.payment_id ?? "unknown"}\n\nRespond in the Square dashboard — disputes have a deadline before Square auto-resolves in the customer's favor.`
      );
    }
  }

  return NextResponse.json({ ok: true });
}
