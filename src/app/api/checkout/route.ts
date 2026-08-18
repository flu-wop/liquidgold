import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getSquare } from "@/lib/square";
import { getDb, ensureSchema } from "@/lib/db";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { getProduct } from "@/lib/products";
import { sendOrderConfirmation } from "@/lib/resend";

export const runtime = "nodejs";

type CartLine = { handle: string; qty: number };

// Server-side only — never trust a discount from the client. Codes are
// case-insensitive on input, normalized to uppercase here.
const DISCOUNT_CODES: Record<string, number> = {
  ISLAND15: 15,
  ISLAND20: 20,
};

// Louisiana STATE sales tax only (5%, per LA Dept of Revenue as of 2025) —
// as an env var, not hardcoded, since even the current published rate is
// inconsistent across sources as of this build, and destination-based
// parish/city tax isn't included at all. This is a flat ESTIMATE, not
// legally accurate compliance — full destination-based tax needs an
// address-level lookup (Square's Tax API, or a service like
// Avalara/TaxJar). Flagged for James to confirm with Ariel/an accountant
// whether state-only is sufficient before this is treated as final. Also
// worth checking whether she's even crossed LA's $100k remote-seller
// nexus threshold yet — if not, collection may not be required at all.
// Set TAX_RATE_LA=0 (or leave unset) to disable entirely.
const LA_STATE_TAX_RATE = Number(process.env.TAX_RATE_LA ?? "0.05");

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
    discountCode?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { sourceId, email, name, address, city, state, zip, items, discountCode } = body;

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

  // Discount applies to subtotal only, validated server-side against the
  // fixed map above — a code the client can't see or forge a percent for.
  let discountCents = 0;
  let appliedCode: string | null = null;
  if (discountCode && typeof discountCode === "string") {
    const normalized = discountCode.trim().toUpperCase();
    const pct = DISCOUNT_CODES[normalized];
    if (pct) {
      discountCents = Math.round(subtotalCents * (pct / 100));
      appliedCode = normalized;
    }
  }

  // LA state sales tax on the discounted subtotal — shipping is stated
  // separately and not taxed (see note above on local/parish tax).
  const taxableCents = subtotalCents - discountCents;
  const taxCents = Math.round(taxableCents * LA_STATE_TAX_RATE);

  const totalCents = taxableCents + taxCents + shippingCents;

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
        (id, square_payment_id, email, name, address, city, state, zip, items_json, subtotal_cents, discount_code, discount_cents, tax_cents, shipping_cents, total_cents)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(square_payment_id) DO NOTHING`,
      args: [
        orderId, paymentId, email, name, address, city, state, zip,
        JSON.stringify(resolvedItems), subtotalCents, appliedCode, discountCents, taxCents, shippingCents, totalCents,
      ],
    });
    if (inserted.rowsAffected > 0) {
      // only email on first insert — never fail the order over an email hiccup
      try {
        await sendOrderConfirmation({
          to: email, name, orderId,
          items: resolvedItems.map((i) => ({ name: i.name, size: i.size, qty: i.qty, price: i.price })),
          subtotal: subtotalCents / 100,
          discountCode: appliedCode,
          discount: discountCents / 100,
          tax: taxCents / 100,
          shipping: shippingCents / 100,
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
        text: `A customer was charged but the order failed to save. Manual reconciliation needed.\n\nSquare Payment ID: ${paymentId}\nOrder ID: ${orderId}\nCustomer: ${name} <${email}>\nAddress: ${address}, ${city}, ${state} ${zip}\nItems: ${JSON.stringify(resolvedItems)}\nSubtotal: $${(subtotalCents / 100).toFixed(2)} | Discount: ${appliedCode ?? "none"} -$${(discountCents / 100).toFixed(2)} | Tax: $${(taxCents / 100).toFixed(2)} | Shipping: $${(shippingCents / 100).toFixed(2)}\nTotal charged: $${(totalCents / 100).toFixed(2)}\n\nError: ${err instanceof Error ? err.message : String(err)}`,
      });
    } catch (alertErr) {
      console.error("fallback alert email also failed", alertErr);
    }
  }

  return NextResponse.json({
    orderId,
    subtotal: subtotalCents / 100,
    discount: discountCents / 100,
    tax: taxCents / 100,
    shipping: shippingCents / 100,
    total: totalCents / 100,
  });
}
