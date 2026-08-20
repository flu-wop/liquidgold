import { Resend } from "resend";
import {
  orderConfirmationEmail,
  shippingUpdateEmail,
  wholesaleNotificationEmail,
  contactNotificationEmail,
} from "./email-templates";
import { logApiCall } from "./db";

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
  const { subject, html } = orderConfirmationEmail(opts);
  const itemLines = opts.items.map((i) => `${i.qty}x ${i.name} (${i.size}) — $${i.price.toFixed(2)}`).join("\n");
  await getResend().emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: opts.to,
    bcc: process.env.RESEND_TO_EMAIL,
    subject,
    html,
    text: `Hi ${opts.name},\n\nYour island escape is on its way.\n\nOrder ${opts.orderId}\n${itemLines}\n\nTotal: $${opts.total.toFixed(2)}\n\n— Liquid Gold Skin Co.`,
  });
  logApiCall("resend");
}

export async function sendShippingUpdate(opts: {
  to: string;
  name: string;
  orderId: string;
  items: { name: string; size: string; qty: number; price: number }[];
  trackingNumber?: string;
  trackingUrl?: string;
  carrier?: string;
}) {
  const { subject, html } = shippingUpdateEmail(opts);
  await getResend().emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: opts.to,
    bcc: process.env.RESEND_TO_EMAIL,
    subject,
    html,
    text: `Hi ${opts.name}, order ${opts.orderId} has shipped.${opts.trackingNumber ? ` Tracking: ${opts.trackingNumber}` : ""}`,
  });
  logApiCall("resend");
}

export async function sendWholesaleNotification(opts: {
  businessName: string;
  email: string;
  businessType: string;
  message: string;
}) {
  const { subject, html } = wholesaleNotificationEmail(opts);
  await getResend().emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: process.env.RESEND_TO_EMAIL!,
    replyTo: opts.email,
    subject,
    html,
    text: `Business: ${opts.businessName}\nEmail: ${opts.email}\nType: ${opts.businessType}\n\n${opts.message}`,
  });
  logApiCall("resend");
}

export async function sendContactNotification(opts: {
  reason: string;
  name: string;
  email: string;
  message: string;
}) {
  const { subject, html } = contactNotificationEmail(opts);
  await getResend().emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: process.env.RESEND_TO_EMAIL!,
    replyTo: opts.email,
    subject,
    html,
    text: `From: ${opts.name} <${opts.email}>\nReason: ${opts.reason}\n\n${opts.message}`,
  });
  logApiCall("resend");
}
