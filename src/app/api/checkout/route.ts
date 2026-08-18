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

function isValidEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) && s.length <= 200;
}

// ── Tax now lives in Square, not in this codebase. ──
// Ariel (or James) sets this up once in Square Dashboard → Settings →
// Business → Sales Tax, and can change the rate anytime with zero code
// changes or redeploys. We just fetch whatever's currently enabled there
// and apply it — same rate whether the sale happens online or in person,
// since it's the same Square account either way. If nothing is configured
// in Square, no tax is applied (fails safe to $0, not to a guessed rate).
async function getEnabledSquareTaxIds(): Promise<string[]> {
  const square = getSquare();
  const ids: string[] = [];
  try {
    const pager = await square.catalog.list({ types: "TAX" });
    for await (const obj of pager) {
      if (obj.type === "TAX" && obj.taxData?.enabled) {
        ids.push(obj.id!);
      }
    }
  } catch (e) {
    console.error("failed to fetch Square tax settings, proceeding with no tax", e);
  }
  return ids;
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

  // ── PRICES LIVE ON THE SERVER — never trust a client-sent amount ──
  let subtotalCents = 0;
  const resolvedItems: { name: string; size: string; type: string; qty: number; price: number }[] = [];
  const lineItems: { uid: string; name: string; quantity: string; basePriceMoney: { amount: bigint; currency: "USD" } }[] = [];
  for (const line of items) {
    if (!line.handle || typeof line.qty !== "number" || line.qty < 1 || line.qty > 20) {
      return NextResponse.json({ error: "Invalid cart line" }, { status: 400 });
    }
    const product = getProduct(line.handle);
    if (!product) {
      return NextResponse.json({ error: `Unknown product: ${line.handle}` }, { status: 400 });
    }
    const unitCents = Math.round(product.price * 100);
    subtotalCents += unitCents * line.qty;
    resolvedItems.push({
      name: product.name.split(" — ")[0],
      size: product.size,
      type: product.type,
      qty: line.qty,
      price: product.price,
    });
    lineItems.push({
      uid: randomUUID(),
      name: `${product.name.split(" — ")[0]} (${product.size})`,
      quantity: String(line.qty),
      basePriceMoney: { amount: BigInt(unitCents), currency: "USD" },
    });
  }
  const shippingCents = subtotalCents >= 5000 ? 0 : 600;

  // Discount — server-validated against the fixed map above, applied as a
  // real Square order-level discount so it shows correctly in her Square
  // dashboard and reporting, not just in our own records.
  let appliedCode: string | null = null;
  let discountPct = 0;
  if (discountCode && typeof discountCode === "string") {
    const normalized = discountCode.trim().toUpperCase();
    const pct = DISCOUNT_CODES[normalized];
    if (pct) {
      appliedCode = normalized;
      discountPct = pct;
    }
  }

  const taxIds = await getEnabledSquareTaxIds();

  const orderId = `LG-${randomUUID().slice(0, 8).toUpperCase()}`;
  const square = getSquare();

  // ── Build the Square Order first — Square computes discount + tax
  // itself from here, we don't calculate those amounts ourselves. Shipping
  // is a service charge, not a line item, so it isn't taxed. ──
  let orderTotalCents: number;
  let squareOrderId: string;
  let discountCents = 0;
  let taxCents = 0;
  try {
    const orderResult = await square.orders.create({
      idempotencyKey: `order-${orderId}`,
      order: {
        locationId: process.env.SQUARE_LOCATION_ID!,
        referenceId: orderId,
        lineItems,
        serviceCharges: shippingCents > 0 ? [{
          uid: randomUUID(),
          name: "Shipping",
          amountMoney: { amount: BigInt(shippingCents), currency: "USD" },
          calculationPhase: "TOTAL_PHASE",
        }] : undefined,
        discounts: appliedCode ? [{
          uid: randomUUID(),
          name: appliedCode,
          percentage: String(discountPct),
          scope: "ORDER",
        }] : undefined,
        taxes: taxIds.map((id) => ({
          uid: randomUUID(),
          catalogObjectId: id,
          scope: "ORDER",
        })),
      },
    });
    const order = orderResult.order;
    if (!order?.id || order.totalMoney?.amount === undefined) {
      return NextResponse.json({ error: "Could not calculate order total" }, { status: 500 });
    }
    squareOrderId = order.id;
    orderTotalCents = Number(order.totalMoney.amount);
    discountCents = Number(order.totalDiscountMoney?.amount ?? 0);
    taxCents = Number(order.totalTaxMoney?.amount ?? 0);
  } catch (err) {
    console.error("Square order creation failed", err);
    return NextResponse.json({ error: "Could not calculate order total. Please try again." }, { status: 500 });
  }

  // ── Create the Square payment against that order ──
  let paymentId: string;
  try {
    const result = await square.payments.create({
      sourceId,
      idempotencyKey: orderId, // prevents double-charging on retry
      orderId: squareOrderId,
      amountMoney: { amount: BigInt(orderTotalCents), currency: "USD" },
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
        JSON.stringify(resolvedItems), subtotalCents, appliedCode, discountCents, taxCents, shippingCents, orderTotalCents,
      ],
    });
    if (inserted.rowsAffected > 0) {
      try {
        await sendOrderConfirmation({
          to: email, name, orderId,
          items: resolvedItems.map((i) => ({ name: i.name, size: i.size, qty: i.qty, price: i.price })),
          subtotal: subtotalCents / 100,
          discountCode: appliedCode,
          discount: discountCents / 100,
          tax: taxCents / 100,
          shipping: shippingCents / 100,
          total: orderTotalCents / 100,
        });
      } catch (e) {
        console.error("order confirmation email failed", e);
      }
    }
  } catch (err) {
    console.error("order save failed (payment already captured!)", err);
    try {
      const { getResend } = await import("@/lib/resend");
      await getResend().emails.send({
        from: process.env.RESEND_FROM_EMAIL!,
        to: process.env.RESEND_TO_EMAIL!,
        subject: `⚠️ Order save failed after payment — ${orderId}`,
        text: `A customer was charged but the order failed to save. Manual reconciliation needed.\n\nSquare Payment ID: ${paymentId}\nSquare Order ID: ${squareOrderId}\nOrder ID: ${orderId}\nCustomer: ${name} <${email}>\nAddress: ${address}, ${city}, ${state} ${zip}\nItems: ${JSON.stringify(resolvedItems)}\nSubtotal: $${(subtotalCents / 100).toFixed(2)} | Discount: ${appliedCode ?? "none"} -$${(discountCents / 100).toFixed(2)} | Tax: $${(taxCents / 100).toFixed(2)} | Shipping: $${(shippingCents / 100).toFixed(2)}\nTotal charged: $${(orderTotalCents / 100).toFixed(2)}\n\nError: ${err instanceof Error ? err.message : String(err)}`,
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
    total: orderTotalCents / 100,
  });
}
