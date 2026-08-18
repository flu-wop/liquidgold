import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getSquare } from "@/lib/square";
import { getDb, ensureSchema } from "@/lib/db";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { getProduct } from "@/lib/products";
import { sendOrderConfirmation } from "@/lib/resend";

export const runtime = "nodejs";

type CartLine = { handle: string; qty: number };

function isValidEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) && s.length <= 200;
}

export async function POST(req: Request) {
  const ip = clientIp(req);
  const allowed = await rateLimit(`checkout:${ip}`, 10, 600); // 10 per 10 min
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: {
    sourceId?: string;
    email?: string;
    name?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    items?: CartLine[];
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { sourceId, email, name, address, city, state, zip, items } = body;

  // ── Validate inputs (length-capped, basic shape checks) ──
  if (!sourceId || typeof sourceId !== "string") {
    return NextResponse.json({ error: "Missing payment token" }, { status: 400 });
  }
  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }
  if (!name || name.length > 100) {
    return NextResponse.json({ error: "Invalid name" }, { status: 400 });
  }
  if (!address || address.length > 200 || !city || city.length > 100 ||
      !state || state.length > 50 || !zip || zip.length > 20) {
    return NextResponse.json({ error: "Invalid shipping address" }, { status: 400 });
  }
  if (!Array.isArray(items) || items.length === 0 || items.length > 50) {
    return NextResponse.json({ error: "Invalid cart" }, { status: 400 });
  }

  // ── PRICE LIVES ON THE SERVER — never trust a client-sent amount ──
  let subtotalCents = 0;
  const resolvedItems: { name: string; size: string; type: string; qty: number; price: number }[] = [];
  for (const line of items) {
    if (!line.handle || typeof line.qty !== "number" || line.qty < 1 || line.qty > 20) {
      return NextResponse.json({ error: "Invalid cart line" }, { status: 400 });
    }
    const product = getProduct(line.handle);
    if (!product) {
      return NextResponse.json({ error: `Unknown product: ${line.handle}` }, { status: 400 });
    }
    subtotalCents += Math.round(product.price * 100) * line.qty;
    resolvedItems.push({
      name: product.name.split(" — ")[0],
      size: product.size,
      type: product.type,
      qty: line.qty,
      price: product.price,
    });
  }
  const shippingCents = subtotalCents >= 5000 ? 0 : 600;
  const totalCents = subtotalCents + shippingCents;

  // ── Create the Square payment ──
  const orderId = `LG-${randomUUID().slice(0, 8).toUpperCase()}`;
  let paymentId: string;
  try {
    const square = getSquare();
    const result = await square.payments.create({
      sourceId,
      idempotencyKey: orderId, // prevents double-charging on retry
      amountMoney: { amount: BigInt(totalCents), currency: "USD" },
      locationId: process.env.SQUARE_LOCATION_ID!,
      note: `Liquid Gold order ${orderId}`,
      buyerEmailAddress: email,
    });
    const payment = result.payment;
    if (!payment?.id || payment.status !== "COMPLETED") {
      return NextResponse.json({ error: "Payment was not completed" }, { status: 402 });
    }
    paymentId = payment.id;
  } catch (err) {
    console.error("Square payment failed", err);
    return NextResponse.json({ error: "Payment failed. Please check your card and try again." }, { status: 402 });
  }

  // ── Save the order (idempotent on square_payment_id) ──
  try {
    await ensureSchema();
    const db = getDb();
    const inserted = await db.execute({
      sql: `INSERT INTO orders
        (id, square_payment_id, email, name, address, city, state, zip, items_json, subtotal_cents, shipping_cents, total_cents)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(square_payment_id) DO NOTHING`,
      args: [
        orderId, paymentId, email, name, address, city, state, zip,
        JSON.stringify(resolvedItems), subtotalCents, shippingCents, totalCents,
      ],
    });
    if (inserted.rowsAffected > 0) {
      // only email on first insert — never fail the order over an email hiccup
      try {
        await sendOrderConfirmation({
          to: email, name, orderId,
          items: resolvedItems.map((i) => ({ name: i.name, size: i.size, qty: i.qty, price: i.price })),
          total: totalCents / 100,
        });
      } catch (e) {
        console.error("order confirmation email failed", e);
      }
    }
  } catch (err) {
    console.error("order save failed (payment already captured!)", err);
    // Payment succeeded but the DB write failed — this must not be a
    // silent console.error nobody sees. Fire a fallback alert through
    // Resend (a separate system from Turso, so likely still up) with
    // everything needed to manually reconcile the order.
    try {
      const { getResend } = await import("@/lib/resend");
      await getResend().emails.send({
        from: process.env.RESEND_FROM_EMAIL!,
        to: process.env.RESEND_TO_EMAIL!,
        subject: `⚠️ Order save failed after payment — ${orderId}`,
        text: `A customer was charged but the order failed to save. Manual reconciliation needed.\n\nSquare Payment ID: ${paymentId}\nOrder ID: ${orderId}\nCustomer: ${name} <${email}>\nAddress: ${address}, ${city}, ${state} ${zip}\nItems: ${JSON.stringify(resolvedItems)}\nTotal: $${(totalCents / 100).toFixed(2)}\n\nError: ${err instanceof Error ? err.message : String(err)}`,
      });
    } catch (alertErr) {
      console.error("fallback alert email also failed", alertErr);
    }
  }

  return NextResponse.json({ orderId, total: totalCents / 100 });
}
