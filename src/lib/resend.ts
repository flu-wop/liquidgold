import { Resend } from "resend";

let _resend: Resend | null = null;
export function getResend(): Resend {
  if (_resend) return _resend;
  _resend = new Resend(process.env.RESEND_API_KEY!);
  return _resend;
}

export async function sendOrderConfirmation(opts: {
  to: string;
  name: string;
  orderId: string;
  items: { name: string; size: string; qty: number; price: number }[];
  subtotal: number;
  discountCode: string | null;
  discount: number;
  tax: number;
  shipping: number;
  total: number;
}) {
  const resend = getResend();
  const itemLines = opts.items
    .map((i) => `${i.qty}x ${i.name} (${i.size}) — $${i.price.toFixed(2)}`)
    .join("\n");
  const discountLine = opts.discount > 0
    ? `Discount (${opts.discountCode}): -$${opts.discount.toFixed(2)}\n`
    : "";
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: opts.to,
    bcc: process.env.RESEND_TO_EMAIL,
    subject: `Your Liquid Gold order is confirmed — ${opts.orderId}`,
    text: `Hi ${opts.name},\n\nYour island escape is on its way.\n\nOrder ${opts.orderId}\n${itemLines}\n\nSubtotal: $${opts.subtotal.toFixed(2)}\n${discountLine}Tax (LA state): $${opts.tax.toFixed(2)}\nShipping: ${opts.shipping === 0 ? "Free" : "$" + opts.shipping.toFixed(2)}\nTotal: $${opts.total.toFixed(2)}\n\n— Liquid Gold Skin Co.`,
  });
}

export async function sendWholesaleNotification(opts: {
  businessName: string;
  email: string;
  businessType: string;
  message: string;
}) {
  const resend = getResend();
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: process.env.RESEND_TO_EMAIL!,
    replyTo: opts.email,
    subject: `Wholesale inquiry — ${opts.businessName}`,
    text: `Business: ${opts.businessName}\nEmail: ${opts.email}\nType: ${opts.businessType}\n\n${opts.message}`,
  });
}

export async function sendContactNotification(opts: {
  reason: string;
  name: string;
  email: string;
  message: string;
}) {
  const resend = getResend();
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: process.env.RESEND_TO_EMAIL!,
    replyTo: opts.email,
    subject: `[${opts.reason}] Contact form — ${opts.name}`,
    text: `From: ${opts.name} <${opts.email}>\nReason: ${opts.reason}\n\n${opts.message}`,
  });
}
