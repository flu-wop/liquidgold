// Branded HTML email templates matching the site's tropical/Bermuda aesthetic.
// Email clients have poor custom-font support, so we use web-safe serif
// fallbacks (Georgia) that approximate Fraunces' warmth instead of relying
// on @font-face, and everything is table-based inline-styled — the only
// layout approach that reliably survives Gmail/Outlook/Apple Mail's varying
// CSS support.

const COLORS = {
  sand: "#FBEEDD",
  cream: "#FFF8EF",
  cocoa: "#3A2318",
  lagoon: "#1B9C93",
  guava: "#FF6F52",
  gold: "#D9A441",
};

function shell(opts: { preheader: string; bodyHtml: string }): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Liquid Gold Skin Co.</title>
</head>
<body style="margin:0; padding:0; background-color:${COLORS.sand}; font-family: Georgia, 'Times New Roman', serif;">
  <span style="display:none; font-size:1px; color:${COLORS.sand}; line-height:1px; max-height:0; max-width:0; opacity:0; overflow:hidden;">${opts.preheader}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${COLORS.sand};">
    <tr><td align="center" style="padding: 32px 16px;">
      <table role="presentation" width="100%" style="max-width:560px;" cellpadding="0" cellspacing="0">

        <tr><td style="background-color:${COLORS.cocoa}; padding:28px 32px; border-radius:4px 4px 0 0;">
          <span style="font-family: Georgia, serif; font-size:22px; font-style: italic; color:#ffffff; letter-spacing:0.5px;">
            Liquid Gold <span style="color:${COLORS.gold};">Skin Co.</span>
          </span>
        </td></tr>

        <tr><td style="background-color:${COLORS.gold}; height:4px; font-size:0; line-height:0;">&nbsp;</td></tr>

        <tr><td style="background-color:${COLORS.cream}; padding:32px;">
          ${opts.bodyHtml}
        </td></tr>

        <tr><td style="background-color:${COLORS.cocoa}; padding:20px 32px; border-radius:0 0 4px 4px; text-align:center;">
          <p style="margin:0; font-family: Arial, sans-serif; font-size:12px; color:#ffffff99;">
            Liquid Gold Skin Co. &middot; Island-Inspired Body Care
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function itemsTable(items: { name: string; size: string; qty: number; price: number }[]): string {
  const rows = items
    .map(
      (i) => `
      <tr>
        <td style="padding:10px 0; border-bottom:1px solid #E8DCC8; font-family: Arial, sans-serif; font-size:14px; color:${COLORS.cocoa};">
          ${i.qty}&times; ${i.name} <span style="color:#8a7660;">(${i.size})</span>
        </td>
        <td style="padding:10px 0; border-bottom:1px solid #E8DCC8; font-family: Arial, sans-serif; font-size:14px; color:${COLORS.cocoa}; text-align:right;">
          $${i.price.toFixed(2)}
        </td>
      </tr>`
    )
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">${rows}</table>`;
}

function summaryRow(label: string, value: string, opts: { bold?: boolean; color?: string } = {}): string {
  return `
    <tr>
      <td style="padding:4px 0; font-family: Arial, sans-serif; font-size:13px; color:${opts.color ?? "#8a7660"}; ${opts.bold ? "font-weight:bold; color:" + COLORS.cocoa + ";" : ""}">${label}</td>
      <td style="padding:4px 0; font-family: Arial, sans-serif; font-size:13px; text-align:right; color:${opts.color ?? "#8a7660"}; ${opts.bold ? "font-weight:bold; color:" + COLORS.cocoa + ";" : ""}">${value}</td>
    </tr>`;
}

export function orderConfirmationEmail(opts: {
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
  const bodyHtml = `
    <p style="margin:0 0 4px; font-family: Georgia, serif; font-size:13px; letter-spacing:1px; text-transform:uppercase; color:${COLORS.guava};">Order Confirmed</p>
    <h1 style="margin:0 0 16px; font-family: Georgia, serif; font-style:italic; font-size:30px; color:${COLORS.cocoa};">Your island escape<br>is on its way.</h1>
    <p style="margin:0 0 4px; font-family: Arial, sans-serif; font-size:14px; color:${COLORS.cocoa};">Hi ${opts.name},</p>
    <p style="margin:0 0 20px; font-family: Arial, sans-serif; font-size:14px; color:#8a7660;">Order <strong style="color:${COLORS.cocoa};">${opts.orderId}</strong> is confirmed. Here's what's headed your way:</p>
    ${itemsTable(opts.items)}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px; border-top:2px solid ${COLORS.cocoa}22; padding-top:8px;">
      ${summaryRow("Subtotal", `$${opts.subtotal.toFixed(2)}`)}
      ${opts.discount > 0 ? summaryRow(`Discount (${opts.discountCode})`, `-$${opts.discount.toFixed(2)}`, { color: COLORS.lagoon }) : ""}
      ${summaryRow("Tax", `$${opts.tax.toFixed(2)}`)}
      ${summaryRow("Shipping", opts.shipping === 0 ? "Free" : `$${opts.shipping.toFixed(2)}`)}
      ${summaryRow("Total", `$${opts.total.toFixed(2)}`, { bold: true })}
    </table>
    <p style="margin:24px 0 0; font-family: Arial, sans-serif; font-size:13px; color:#8a7660;">We'll send another note the moment it ships.</p>
  `;
  return {
    subject: `Your Liquid Gold order is confirmed — ${opts.orderId}`,
    html: shell({ preheader: `Order ${opts.orderId} confirmed — $${opts.total.toFixed(2)}`, bodyHtml }),
  };
}

export function shippingUpdateEmail(opts: {
  name: string;
  orderId: string;
  items: { name: string; size: string; qty: number; price: number }[];
  trackingNumber?: string;
  trackingUrl?: string;
  carrier?: string;
}) {
  const bodyHtml = `
    <p style="margin:0 0 4px; font-family: Georgia, serif; font-size:13px; letter-spacing:1px; text-transform:uppercase; color:${COLORS.lagoon};">On Its Way</p>
    <h1 style="margin:0 0 16px; font-family: Georgia, serif; font-style:italic; font-size:30px; color:${COLORS.cocoa};">Your order shipped.</h1>
    <p style="margin:0 0 20px; font-family: Arial, sans-serif; font-size:14px; color:#8a7660;">Hi ${opts.name}, order <strong style="color:${COLORS.cocoa};">${opts.orderId}</strong> is on its way.</p>
    ${
      opts.trackingNumber
        ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${COLORS.sand}; border-radius:8px; margin-bottom:20px;">
            <tr><td style="padding:16px 20px;">
              <p style="margin:0 0 4px; font-family: Arial, sans-serif; font-size:12px; color:#8a7660;">${opts.carrier ?? "Tracking"} Number</p>
              <p style="margin:0; font-family: Arial, sans-serif; font-size:15px; font-weight:bold; color:${COLORS.cocoa};">
                ${opts.trackingUrl ? `<a href="${opts.trackingUrl}" style="color:${COLORS.cocoa}; text-decoration:underline;">${opts.trackingNumber}</a>` : opts.trackingNumber}
              </p>
            </td></tr>
          </table>`
        : ""
    }
    ${itemsTable(opts.items)}
  `;
  return {
    subject: `Your Liquid Gold order has shipped — ${opts.orderId}`,
    html: shell({ preheader: `Order ${opts.orderId} is on its way`, bodyHtml }),
  };
}

export function wholesaleNotificationEmail(opts: {
  businessName: string;
  email: string;
  businessType: string;
  message: string;
}) {
  const bodyHtml = `
    <p style="margin:0 0 4px; font-family: Georgia, serif; font-size:13px; letter-spacing:1px; text-transform:uppercase; color:${COLORS.gold};">New Wholesale Inquiry</p>
    <h1 style="margin:0 0 16px; font-family: Georgia, serif; font-style:italic; font-size:26px; color:${COLORS.cocoa};">${opts.businessName}</h1>
    <p style="margin:0 0 4px; font-family: Arial, sans-serif; font-size:14px; color:${COLORS.cocoa};"><strong>Email:</strong> ${opts.email}</p>
    <p style="margin:0 0 16px; font-family: Arial, sans-serif; font-size:14px; color:${COLORS.cocoa};"><strong>Type:</strong> ${opts.businessType || "\u2014"}</p>
    <p style="margin:0; font-family: Arial, sans-serif; font-size:14px; color:#8a7660; white-space:pre-wrap;">${opts.message || "\u2014"}</p>
  `;
  return {
    subject: `Wholesale inquiry — ${opts.businessName}`,
    html: shell({ preheader: `New wholesale inquiry from ${opts.businessName}`, bodyHtml }),
  };
}

export function contactNotificationEmail(opts: {
  reason: string;
  name: string;
  email: string;
  message: string;
}) {
  const bodyHtml = `
    <p style="margin:0 0 4px; font-family: Georgia, serif; font-size:13px; letter-spacing:1px; text-transform:uppercase; color:${COLORS.gold};">New Message &middot; ${opts.reason}</p>
    <h1 style="margin:0 0 16px; font-family: Georgia, serif; font-style:italic; font-size:26px; color:${COLORS.cocoa};">${opts.name}</h1>
    <p style="margin:0 0 16px; font-family: Arial, sans-serif; font-size:14px; color:${COLORS.cocoa};"><strong>Email:</strong> ${opts.email}</p>
    <p style="margin:0; font-family: Arial, sans-serif; font-size:14px; color:#8a7660; white-space:pre-wrap;">${opts.message}</p>
  `;
  return {
    subject: `[${opts.reason}] Contact form — ${opts.name}`,
    html: shell({ preheader: `New message from ${opts.name}`, bodyHtml }),
  };
}
