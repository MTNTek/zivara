/**
 * Branded email template wrapper for Zivara.
 * All emails share a consistent header, footer, and styling.
 */

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://zivara.com';

function wrapTemplate(body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:system-ui,-apple-system,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:24px 0">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%">
  <tr><td style="background:#1e3a5f;padding:20px 24px;border-radius:8px 8px 0 0">
    <a href="${APP_URL}" style="color:#ffffff;font-size:24px;font-weight:bold;text-decoration:none">Zivara</a>
  </td></tr>
  <tr><td style="background:#ffffff;padding:32px 24px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb">
    ${body}
  </td></tr>
  <tr><td style="background:#f9fafb;padding:20px 24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;text-align:center">
    <p style="margin:0 0 8px;font-size:12px;color:#6b7280">Zivara — Your Online Shopping Destination</p>
    <p style="margin:0;font-size:11px;color:#9ca3af">
      <a href="${APP_URL}/terms" style="color:#9ca3af">Terms</a> · 
      <a href="${APP_URL}/privacy" style="color:#9ca3af">Privacy</a> · 
      <a href="${APP_URL}/contact" style="color:#9ca3af">Contact</a>
    </p>
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

function btn(text: string, href: string): string {
  return `<a href="${href}" style="display:inline-block;background:#fbbf24;color:#0F1111;font-weight:600;font-size:14px;padding:10px 24px;border-radius:9999px;text-decoration:none;margin:8px 0">${text}</a>`;
}

function divider(): string {
  return '<hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>';
}

export function welcomeHtml(name: string): string {
  return wrapTemplate(`
    <h2 style="color:#0F1111;margin:0 0 8px;font-size:20px">Welcome, ${name}!</h2>
    <p style="color:#565959;font-size:14px;line-height:1.6;margin:0 0 16px">
      Thanks for creating your Zivara account. You're all set to discover great products at amazing prices.
    </p>
    ${btn('Start Shopping', `${APP_URL}/products`)}
    ${divider()}
    <p style="font-size:13px;color:#6b7280;margin:0">
      Need help? <a href="${APP_URL}/faq" style="color:#2563eb">Visit our FAQ</a> or 
      <a href="${APP_URL}/contact" style="color:#2563eb">contact us</a>.
    </p>
  `);
}

export function orderConfirmationHtml(data: {
  orderNumber: string;
  customerEmail: string;
  customerName?: string;
  orderDate: string;
  items: Array<{ name: string; quantity: number; price: string }>;
  subtotal: string;
  tax: string;
  shipping: string;
  total: string;
  shippingAddress: { line1: string; line2?: string; city: string; state: string; postalCode: string; country: string };
  trackingUrl: string;
}): string {
  const itemRows = data.items
    .map(
      (i) =>
        `<tr>
          <td style="padding:8px 0;font-size:14px;color:#0F1111;border-bottom:1px solid #f3f4f6">${i.name}</td>
          <td style="padding:8px 12px;font-size:14px;color:#565959;text-align:center;border-bottom:1px solid #f3f4f6">×${i.quantity}</td>
          <td style="padding:8px 0;font-size:14px;color:#0F1111;text-align:right;border-bottom:1px solid #f3f4f6">$${i.price}</td>
        </tr>`
    )
    .join('');

  const addr = data.shippingAddress;
  const addrLines = [addr.line1, addr.line2, `${addr.city}, ${addr.state} ${addr.postalCode}`, addr.country].filter(Boolean);

  return wrapTemplate(`
    <h2 style="color:#0F1111;margin:0 0 4px;font-size:20px">Thank you for your order!</h2>
    <p style="color:#565959;font-size:14px;margin:0 0 20px">
      Order <strong>#${data.orderNumber}</strong> · ${data.orderDate}
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px">
      <thead>
        <tr style="border-bottom:2px solid #e5e7eb">
          <th style="text-align:left;padding:8px 0;font-size:12px;color:#6b7280;text-transform:uppercase">Item</th>
          <th style="text-align:center;padding:8px 12px;font-size:12px;color:#6b7280;text-transform:uppercase">Qty</th>
          <th style="text-align:right;padding:8px 0;font-size:12px;color:#6b7280;text-transform:uppercase">Price</th>
        </tr>
      </thead>
      <tbody>${itemRows}</tbody>
      <tfoot>
        <tr><td colspan="2" style="padding:6px 0;font-size:13px;color:#565959">Subtotal</td><td style="text-align:right;font-size:13px">$${data.subtotal}</td></tr>
        <tr><td colspan="2" style="padding:6px 0;font-size:13px;color:#565959">Tax</td><td style="text-align:right;font-size:13px">$${data.tax}</td></tr>
        <tr><td colspan="2" style="padding:6px 0;font-size:13px;color:#565959">Shipping</td><td style="text-align:right;font-size:13px">${data.shipping === '0.00' || data.shipping === '0' ? '<span style="color:#16a34a;font-weight:600">FREE</span>' : '$' + data.shipping}</td></tr>
        <tr style="border-top:2px solid #0F1111"><td colspan="2" style="padding:10px 0;font-size:15px;font-weight:bold;color:#0F1111">Total</td><td style="text-align:right;font-size:15px;font-weight:bold;color:#0F1111">$${data.total}</td></tr>
      </tfoot>
    </table>
    <div style="background:#f9fafb;border-radius:8px;padding:16px;margin-bottom:20px">
      <p style="margin:0 0 4px;font-size:12px;color:#6b7280;text-transform:uppercase;font-weight:600">Ship to</p>
      <p style="margin:0;font-size:14px;color:#0F1111;line-height:1.5">${addrLines.join('<br/>')}</p>
    </div>
    ${btn('Track Your Order', data.trackingUrl)}
  `);
}

export function shippingNotificationHtml(data: {
  orderNumber: string;
  trackingNumber?: string;
  carrierName?: string;
  estimatedDeliveryDate?: string;
  trackingUrl: string;
}): string {
  const details = [
    data.trackingNumber && `<strong>Tracking:</strong> ${data.trackingNumber}`,
    data.carrierName && `<strong>Carrier:</strong> ${data.carrierName}`,
    data.estimatedDeliveryDate && `<strong>Estimated delivery:</strong> ${data.estimatedDeliveryDate}`,
  ].filter(Boolean);

  return wrapTemplate(`
    <div style="text-align:center;margin-bottom:16px"><span style="font-size:40px">📦</span></div>
    <h2 style="color:#0F1111;margin:0 0 8px;font-size:20px;text-align:center">Your order is on its way!</h2>
    <p style="color:#565959;font-size:14px;text-align:center;margin:0 0 20px">
      Order <strong>#${data.orderNumber}</strong> has been shipped.
    </p>
    ${details.length > 0 ? `<div style="background:#f9fafb;border-radius:8px;padding:16px;margin-bottom:20px;font-size:14px;color:#0F1111;line-height:1.8">${details.join('<br/>')}</div>` : ''}
    <div style="text-align:center">${btn('Track Your Order', data.trackingUrl)}</div>
  `);
}

export function deliveryConfirmationHtml(data: {
  orderNumber: string;
  deliveryDate: string;
}): string {
  return wrapTemplate(`
    <div style="text-align:center;margin-bottom:16px"><span style="font-size:40px">✅</span></div>
    <h2 style="color:#0F1111;margin:0 0 8px;font-size:20px;text-align:center">Your order has been delivered!</h2>
    <p style="color:#565959;font-size:14px;text-align:center;margin:0 0 20px">
      Order <strong>#${data.orderNumber}</strong> was delivered on ${data.deliveryDate}.
    </p>
    <div style="text-align:center">${btn('View Your Orders', `${APP_URL}/orders`)}</div>
    ${divider()}
    <p style="font-size:13px;color:#6b7280;text-align:center;margin:0">
      Enjoyed your purchase? <a href="${APP_URL}/orders" style="color:#2563eb">Leave a review</a> to help other shoppers.
    </p>
  `);
}

export function passwordResetHtml(resetToken: string): string {
  return wrapTemplate(`
    <h2 style="color:#0F1111;margin:0 0 8px;font-size:20px">Password Reset</h2>
    <p style="color:#565959;font-size:14px;line-height:1.6;margin:0 0 20px">
      We received a request to reset your password. Click the button below to set a new one.
    </p>
    ${btn('Reset Password', `${APP_URL}/reset-password?token=${resetToken}`)}
    ${divider()}
    <p style="font-size:12px;color:#9ca3af;margin:0">
      This link expires in 1 hour. If you didn't request this, you can safely ignore this email.
    </p>
  `);
}

export function emailVerificationHtml(verificationToken: string): string {
  return wrapTemplate(`
    <h2 style="color:#0F1111;margin:0 0 8px;font-size:20px">Verify your email address</h2>
    <p style="color:#565959;font-size:14px;line-height:1.6;margin:0 0 20px">
      Click the button below to verify your email and complete your account setup.
    </p>
    ${btn('Verify Email', `${APP_URL}/api/auth/verify-email?token=${verificationToken}`)}
    ${divider()}
    <p style="font-size:12px;color:#9ca3af;margin:0">This link expires in 24 hours.</p>
  `);
}
