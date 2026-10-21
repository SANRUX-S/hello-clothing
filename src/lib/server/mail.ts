import { Resend } from 'resend';

// Sender email addresses configured under helloclothing.store
export const EMAIL_FROM = {
  orders: 'HELLO! Clothing Orders <orders@helloclothing.store>',
  support: 'HELLO! Support <support@helloclothing.store>',
  drops: 'HELLO! Drops & VIP <drops@helloclothing.store>',
};

export const ADMIN_NOTIFY_EMAIL = process.env.ADMIN_NOTIFY_EMAIL || 'orders@helloclothing.store';

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey === 're_placeholder' || apiKey.trim() === '') {
    return null;
  }
  return new Resend(apiKey.trim());
}

function formatLKR(amountMinorOrMajor: number): string {
  // If amount is in minor units (e.g. 349000 for 3,490)
  const val = amountMinorOrMajor > 10000 ? Math.round(amountMinorOrMajor / 100) : amountMinorOrMajor;
  return `LKR ${val.toLocaleString('en-LK')}`;
}

const baseEmailStyle = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  background-color: #0c0d0d;
  color: #ededed;
  margin: 0;
  padding: 0;
  width: 100% !important;
  -webkit-text-size-adjust: 100%;
`;

/**
 * 1. Customer Order Confirmation Email
 */
export async function sendOrderConfirmationEmail(order: {
  reference: string;
  customer: { name?: string; email?: string; phone?: string; address?: string; city?: string };
  items?: Array<{ name: string; color?: string; size?: string; quantity: number; unitPrice?: number; lineTotal?: number; image?: string }>;
  subtotal?: number;
  delivery?: number;
  total?: number;
  paymentMethod?: string;
  payment_method?: string;
}) {
  const resend = getResendClient();
  const customerEmail = order.customer?.email?.trim();

  if (!customerEmail || !customerEmail.includes('@')) {
    console.warn(`[Resend] No valid customer email for order ${order.reference}.`);
    return { success: false, reason: 'missing_customer_email' };
  }

  const payMethod = order.paymentMethod || order.payment_method || 'cod';
  const payLabel = payMethod === 'cod'
    ? 'Cash on Delivery (Pay cash to PromptX rider)'
    : payMethod === 'bank'
    ? 'Bank Transfer / Deposit'
    : 'Credit / Debit Card (Verified)';

  const trackUrl = `https://www.helloclothing.store/track-order?ref=${encodeURIComponent(order.reference)}`;
  const receiptUrl = `https://www.helloclothing.store/order-confirmation/${encodeURIComponent(order.reference)}`;
  const subtotalFormatted = formatLKR(order.subtotal || 0);
  const deliveryFormatted = (order.delivery === 0) ? 'FREE' : formatLKR(order.delivery || 50000);
  const totalFormatted = formatLKR(order.total || 0);

  const itemsHtml = (order.items || []).map(item => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #222; vertical-align: middle;">
        <strong style="color: #ffffff; font-size: 14px; display: block;">${item.name}</strong>
        <span style="color: #888888; font-size: 12px;">Color: ${item.color || 'Standard'} &middot; Size: ${item.size || 'M'} &middot; Qty: ${item.quantity}</span>
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #222; text-align: right; vertical-align: middle; color: #ffffff; font-weight: 600; font-size: 14px;">
        ${formatLKR(item.lineTotal || (item.unitPrice ? item.unitPrice * item.quantity : 0))}
      </td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <title>HELLO! Order Confirmation</title>
    </head>
    <body style="${baseEmailStyle}">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #0c0d0d; padding: 30px 15px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 580px; background-color: #141515; border: 1px solid #262727; border-radius: 12px; overflow: hidden; padding: 32px 28px; text-align: left;">
              <!-- Header -->
              <tr>
                <td style="border-bottom: 1px solid #262727; padding-bottom: 20px;">
                  <span style="font-size: 26px; font-weight: 900; letter-spacing: 2px; color: #ffffff; display: block;">HELLO!</span>
                  <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #888888;">Heavyweight Streetwear &middot; Colombo</span>
                </td>
              </tr>

              <!-- Greeting -->
              <tr>
                <td style="padding: 24px 0 16px;">
                  <span style="display: inline-block; background: #052e16; border: 1px solid #166534; color: #4ade80; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 4px; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 12px;">Order Confirmed</span>
                  <h1 style="color: #ffffff; font-size: 22px; font-weight: 800; margin: 0 0 8px; letter-spacing: -0.5px;">LOOKING GOOD, ${order.customer?.name || 'VALUED CUSTOMER'}.</h1>
                  <p style="color: #aaaaaa; font-size: 14px; line-height: 1.5; margin: 0;">
                    Thank you for shopping with HELLO! Clothing. Your order has been registered in our fulfillment hub and is being prepared for dispatch.
                  </p>
                </td>
              </tr>

              <!-- Order Ref Banner -->
              <tr>
                <td style="background: #1c1d1d; border: 1px solid #2e3030; border-radius: 8px; padding: 14px 18px; margin: 12px 0;">
                  <div style="font-size: 11px; color: #888888; text-transform: uppercase; letter-spacing: 0.5px;">Your Order Reference</div>
                  <div style="font-size: 20px; font-weight: 900; color: #ffffff; letter-spacing: 1px;">${order.reference}</div>
                </td>
              </tr>

              <!-- Items List -->
              <tr>
                <td style="padding-top: 20px;">
                  <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #888888; display: block; margin-bottom: 8px;">Parcel Contents</span>
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                    ${itemsHtml}
                  </table>
                </td>
              </tr>

              <!-- Summary -->
              <tr>
                <td style="padding-top: 16px;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="font-size: 13px; color: #aaaaaa;">
                    <tr>
                      <td style="padding: 4px 0;">Subtotal</td>
                      <td style="padding: 4px 0; text-align: right; color: #ffffff;">${subtotalFormatted}</td>
                    </tr>
                    <tr>
                      <td style="padding: 4px 0;">Islandwide Courier Delivery</td>
                      <td style="padding: 4px 0; text-align: right; color: #ffffff;">${deliveryFormatted}</td>
                    </tr>
                    <tr style="border-top: 1px solid #262727; font-size: 16px; font-weight: 800;">
                      <td style="padding: 12px 0 6px; color: #ffffff;">Total Amount</td>
                      <td style="padding: 12px 0 6px; text-align: right; color: #4ade80;">${totalFormatted}</td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Delivery & Payment Info -->
              <tr>
                <td style="padding-top: 20px;">
                  <div style="background: #181919; border: 1px solid #262727; border-radius: 8px; padding: 14px 16px; font-size: 13px; line-height: 1.5; color: #cccccc;">
                    <strong style="color: #ffffff; display: block; margin-bottom: 4px;">Delivery Address:</strong>
                    ${order.customer?.address || 'Address on file'}, ${order.customer?.city || 'Colombo'}<br>
                    <span style="color: #888888;">Phone: ${order.customer?.phone || 'N/A'}</span>
                    <div style="margin-top: 10px; padding-top: 8px; border-top: 1px solid #262727;">
                      <strong style="color: #ffffff;">Payment Method:</strong> ${payLabel}
                    </div>
                  </div>
                </td>
              </tr>

              ${payMethod === 'bank' ? `
              <!-- Bank Transfer Instructions -->
              <tr>
                <td style="padding-top: 16px;">
                  <div style="background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 14px 16px; font-size: 13px; color: #e2e8f0;">
                    <strong style="color: #38bdf8; display: block; margin-bottom: 6px;">Bank Transfer Instructions:</strong>
                    Bank: Commercial Bank of Ceylon | Branch: Colombo City<br>
                    Account Name: HELLO! CLOTHING PVT LTD<br>
                    Account No: 1000 2489 1234<br>
                    <span style="font-size: 12px; color: #94a3b8; display: block; margin-top: 6px;">
                      Please WhatsApp your deposit slip with reference <strong>${order.reference}</strong> to <strong>+94 78 619 1260</strong>.
                    </span>
                  </div>
                </td>
              </tr>` : ''}

              <!-- CTA Buttons -->
              <tr>
                <td style="padding-top: 28px; text-align: center;">
                  <a href="${trackUrl}" target="_blank" style="display: inline-block; background-color: #ffffff; color: #000000; font-size: 13px; font-weight: 800; letter-spacing: 0.5px; text-decoration: none; padding: 13px 24px; border-radius: 6px; text-transform: uppercase; margin: 4px;">
                    Track Order Live &rarr;
                  </a>
                  <a href="${receiptUrl}" target="_blank" style="display: inline-block; background-color: #1f2022; border: 1px solid #383a3e; color: #4ade80; font-size: 13px; font-weight: 700; letter-spacing: 0.5px; text-decoration: none; padding: 12px 22px; border-radius: 6px; text-transform: uppercase; margin: 4px;">
                    View / Print Receipt &rarr;
                  </a>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding-top: 36px; border-top: 1px solid #262727; margin-top: 28px; font-size: 11px; color: #666666; line-height: 1.6; text-align: center;">
                  HELLO! Clothing Sri Lanka &middot; Designed & Dispatched from Colombo<br>
                  Need assistance? Reply to this email or reach us at <a href="mailto:support@helloclothing.store" style="color: #888888; text-decoration: underline;">support@helloclothing.store</a><br>
                  &copy; ${new Date().getFullYear()} HELLO! CLOTHING. All rights reserved.
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  if (!resend) {
    console.log(`[Resend Mock] RESEND_API_KEY not configured. Customer email simulated to: ${customerEmail}`);
    return { success: true, simulated: true };
  }

  try {
    const data = await resend.emails.send({
      from: EMAIL_FROM.orders,
      to: customerEmail,
      subject: `Order Confirmed: ${order.reference} — HELLO! Clothing`,
      html,
    });
    return { success: true, data };
  } catch (err: any) {
    console.error(`[Resend Error] Failed to send order confirmation to ${customerEmail}:`, err);
    return { success: false, error: err?.message || 'Email delivery failed' };
  }
}

/**
 * 2. Store Admin Notification Email for New Order
 */
export async function sendAdminNewOrderAlert(order: {
  reference: string;
  customer: { name?: string; email?: string; phone?: string; address?: string; city?: string };
  items?: Array<{ name: string; color?: string; size?: string; quantity: number; unitPrice?: number; lineTotal?: number }>;
  total?: number;
  paymentMethod?: string;
  payment_method?: string;
}, adminTargetEmail = ADMIN_NOTIFY_EMAIL) {
  const resend = getResendClient();
  const payMethod = order.paymentMethod || order.payment_method || 'cod';
  const totalFormatted = formatLKR(order.total || 0);
  const cleanPhone = (order.customer?.phone || '').replace(/[^0-9]/g, '');
  const wpPhone = cleanPhone.startsWith('0') ? '94' + cleanPhone.slice(1) : cleanPhone;
  const wpUrl = cleanPhone ? `https://wa.me/${wpPhone}?text=${encodeURIComponent(`Hello ${order.customer?.name}! This is HELLO! Clothing regarding your order ${order.reference}.`)}` : '#';

  const itemsList = (order.items || []).map(it => `&bull; ${it.name} (${it.color || 'Standard'} / ${it.size || 'M'}) &times; ${it.quantity} &mdash; ${formatLKR(it.lineTotal || 0)}`).join('<br>');

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <body style="${baseEmailStyle}">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #0c0d0d; padding: 24px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 580px; background-color: #141515; border: 1px solid #262727; border-radius: 12px; padding: 28px; color: #ededed;">
              <tr>
                <td style="border-bottom: 1px solid #262727; padding-bottom: 16px;">
                  <span style="background: #1e3a8a; color: #93c5fd; font-size: 11px; font-weight: 800; padding: 3px 8px; border-radius: 4px; text-transform: uppercase;">ADMIN NOTIFICATION</span>
                  <h2 style="color: #ffffff; margin: 8px 0 4px; font-size: 20px;">🔔 New Order Received: ${order.reference}</h2>
                  <span style="color: #4ade80; font-size: 18px; font-weight: 800;">Total: ${totalFormatted}</span>
                </td>
              </tr>

              <tr>
                <td style="padding: 18px 0;">
                  <strong style="color: #ffffff; font-size: 14px;">Customer Information:</strong>
                  <div style="background: #1c1d1d; border-radius: 6px; padding: 12px; margin-top: 6px; font-size: 13px; line-height: 1.5;">
                    <strong>Name:</strong> ${order.customer?.name || 'N/A'}<br>
                    <strong>Phone:</strong> ${order.customer?.phone || 'N/A'} 
                    ${cleanPhone ? `(<a href="${wpUrl}" target="_blank" style="color: #4ade80; text-decoration: underline; font-weight: 700;">WhatsApp Customer</a>)` : ''}<br>
                    <strong>Email:</strong> ${order.customer?.email || 'N/A'}<br>
                    <strong>Address:</strong> ${order.customer?.address || 'N/A'}, ${order.customer?.city || 'N/A'}<br>
                    <strong>Payment:</strong> <span style="text-transform: uppercase; font-weight: 700; color: #ffffff;">${payMethod}</span>
                  </div>
                </td>
              </tr>

              <tr>
                <td style="padding-bottom: 20px;">
                  <strong style="color: #ffffff; font-size: 14px;">Ordered Items:</strong>
                  <div style="background: #1c1d1d; border-radius: 6px; padding: 12px; margin-top: 6px; font-size: 13px; line-height: 1.6; color: #cccccc;">
                    ${itemsList}
                  </div>
                </td>
              </tr>

              <tr>
                <td style="text-align: center; padding-top: 10px;">
                  <a href="https://www.helloclothing.store/admin/orders" target="_blank" style="display: inline-block; background: #ffffff; color: #000000; font-weight: 800; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-size: 13px; text-transform: uppercase;">
                    Manage in Admin Panel &rarr;
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  if (!resend) {
    console.log(`[Resend Mock] Admin alert simulated to: ${adminTargetEmail}`);
    return { success: true, simulated: true };
  }

  try {
    const data = await resend.emails.send({
      from: EMAIL_FROM.orders,
      to: adminTargetEmail,
      subject: `🔔 New Order: ${order.reference} — ${totalFormatted} (${order.customer?.name || 'Customer'})`,
      html,
    });
    return { success: true, data };
  } catch (err: any) {
    console.error(`[Resend Error] Failed to send admin order alert:`, err);
    return { success: false, error: err?.message };
  }
}

/**
 * 3. Customer Order Status Update Email (Dispatched, Delivered, Confirmed)
 */
export async function sendOrderStatusUpdateEmail(order: {
  reference: string;
  status: string;
  courier?: string;
  tracking_number?: string;
  customer?: { name?: string; email?: string; city?: string };
}) {
  const resend = getResendClient();
  const customerEmail = order.customer?.email?.trim();
  if (!customerEmail || !customerEmail.includes('@')) {
    return { success: false, reason: 'missing_email' };
  }

  const status = order.status;
  let statusTitle = '';
  let statusBadge = '';
  let statusMessage = '';
  let subject = '';

  const courierName = order.courier || 'PromptX Logistics';
  const waybill = order.tracking_number || '';

  if (status === 'dispatched' || status === 'out_for_delivery') {
    subject = `🚚 Dispatched: Your HELLO! Order ${order.reference} is on its way!`;
    statusTitle = 'YOUR PIECE IS EN ROUTE.';
    statusBadge = 'DISPATCHED WITH COURIER';
    statusMessage = `Great news! Your HELLO! parcel has been packed, quality checked, and handed over to our courier partner <strong>${courierName}</strong>.${waybill ? ` Your tracking waybill number is <strong>#${waybill}</strong>.` : ''} Delivery typically takes 1&ndash;3 business days.`;
  } else if (status === 'delivered') {
    subject = `🎉 Delivered: Your HELLO! Order ${order.reference}`;
    statusTitle = 'DELIVERED TO YOUR DOORSTEP.';
    statusBadge = 'DELIVERED';
    statusMessage = `Your parcel has been successfully delivered by ${courierName}. We hope you love the fit and heavyweight feel! Tag us on Instagram @hello.streetwear to be featured.`;
  } else if (status === 'confirmed' || status === 'production') {
    subject = `✅ Order Confirmed: ${order.reference} — HELLO! Clothing`;
    statusTitle = 'ORDER CONFIRMED & IN PREPARATION.';
    statusBadge = 'CONFIRMED';
    statusMessage = `Your order details and stock have been verified by our Colombo fulfillment team. We are packing your pieces in our signature branded dust bag.`;
  } else if (status === 'cancelled') {
    subject = `Notice: HELLO! Order ${order.reference} Cancelled`;
    statusTitle = 'ORDER STATUS UPDATE.';
    statusBadge = 'CANCELLED';
    statusMessage = `Your order ${order.reference} has been cancelled. If you believe this is in error, please reply directly to this email or contact support@helloclothing.store.`;
  } else {
    // Default processing update
    subject = `Update: HELLO! Order ${order.reference} (${status})`;
    statusTitle = `ORDER STATUS: ${status.toUpperCase()}`;
    statusBadge = status.toUpperCase();
    statusMessage = `Your order status has been updated to "${status}".`;
  }

  const trackUrl = `https://www.helloclothing.store/track-order?ref=${encodeURIComponent(order.reference)}`;
  const receiptUrl = `https://www.helloclothing.store/order-confirmation/${encodeURIComponent(order.reference)}`;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <body style="${baseEmailStyle}">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #0c0d0d; padding: 30px 15px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 580px; background-color: #141515; border: 1px solid #262727; border-radius: 12px; padding: 32px 28px; color: #ededed;">
              <tr>
                <td style="border-bottom: 1px solid #262727; padding-bottom: 20px;">
                  <span style="font-size: 26px; font-weight: 900; letter-spacing: 2px; color: #ffffff; display: block;">HELLO!</span>
                  <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #888888;">Order Status Notification</span>
                </td>
              </tr>

              <tr>
                <td style="padding: 24px 0;">
                  <span style="display: inline-block; background: #052e16; border: 1px solid #166534; color: #4ade80; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 4px; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 12px;">${statusBadge}</span>
                  <h1 style="color: #ffffff; font-size: 22px; font-weight: 800; margin: 0 0 12px; letter-spacing: -0.5px;">${statusTitle}</h1>
                  <p style="color: #cccccc; font-size: 14px; line-height: 1.6; margin: 0;">
                    Hello ${order.customer?.name || 'Valued Customer'},<br><br>
                    ${statusMessage}
                  </p>
                </td>
              </tr>

              <tr>
                <td style="background: #1c1d1d; border: 1px solid #2e3030; border-radius: 8px; padding: 16px 18px;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="font-size: 13px;">
                    <tr>
                      <td style="color: #888888;">Order Reference:</td>
                      <td style="text-align: right; color: #ffffff; font-weight: 700;">${order.reference}</td>
                    </tr>
                    <tr>
                      <td style="color: #888888; padding-top: 6px;">Courier Partner:</td>
                      <td style="text-align: right; color: #ffffff; padding-top: 6px;">${courierName}</td>
                    </tr>
                    ${waybill ? `
                    <tr>
                      <td style="color: #888888; padding-top: 6px;">Waybill Tracking #:</td>
                      <td style="text-align: right; color: #4ade80; font-weight: 700; padding-top: 6px;">#${waybill}</td>
                    </tr>` : ''}
                  </table>
                </td>
              </tr>

              <tr>
                <td style="padding-top: 28px; text-align: center;">
                  <a href="${trackUrl}" target="_blank" style="display: inline-block; background-color: #ffffff; color: #000000; font-size: 13px; font-weight: 800; letter-spacing: 0.5px; text-decoration: none; padding: 13px 24px; border-radius: 6px; text-transform: uppercase; margin: 4px;">
                    View Live Courier Progress &rarr;
                  </a>
                  <a href="${receiptUrl}" target="_blank" style="display: inline-block; background-color: #1f2022; border: 1px solid #383a3e; color: #4ade80; font-size: 13px; font-weight: 700; letter-spacing: 0.5px; text-decoration: none; padding: 12px 22px; border-radius: 6px; text-transform: uppercase; margin: 4px;">
                    View Official Receipt &rarr;
                  </a>
                </td>
              </tr>

              <tr>
                <td style="padding-top: 36px; border-top: 1px solid #262727; margin-top: 28px; font-size: 11px; color: #666666; line-height: 1.6; text-align: center;">
                  HELLO! Clothing Sri Lanka &middot; Dispatched from Colombo<br>
                  Questions? Reach us at <a href="mailto:orders@helloclothing.store" style="color: #888888; text-decoration: underline;">orders@helloclothing.store</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  if (!resend) {
    console.log(`[Resend Mock] Status update email simulated to: ${customerEmail} (Status: ${status})`);
    return { success: true, simulated: true };
  }

  try {
    const data = await resend.emails.send({
      from: EMAIL_FROM.orders,
      to: customerEmail,
      subject,
      html,
    });
    return { success: true, data };
  } catch (err: any) {
    console.error(`[Resend Error] Status update email failed:`, err);
    return { success: false, error: err?.message };
  }
}

/**
 * 4. Contact Form Inquiries (from support@helloclothing.store)
 */
export async function sendContactInquiryEmails({
  name,
  email,
  message,
  reference,
}: {
  name: string;
  email: string;
  message: string;
  reference?: string;
}) {
  const resend = getResendClient();
  const inquiryRef = reference || `INQ-${Date.now().toString().slice(-6)}`;

  // 1. Auto-reply to customer
  const customerHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <body style="${baseEmailStyle}">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #0c0d0d; padding: 24px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 580px; background-color: #141515; border: 1px solid #262727; border-radius: 12px; padding: 28px; color: #ededed;">
              <tr>
                <td style="border-bottom: 1px solid #262727; padding-bottom: 16px;">
                  <span style="font-size: 24px; font-weight: 900; letter-spacing: 2px; color: #ffffff;">HELLO! SUPPORT</span>
                </td>
              </tr>
              <tr>
                <td style="padding: 20px 0;">
                  <h2 style="color: #ffffff; font-size: 18px; margin: 0 0 8px;">We've Received Your Message (${inquiryRef})</h2>
                  <p style="color: #aaaaaa; font-size: 14px; line-height: 1.6;">
                    Hello ${name},<br><br>
                    Thank you for reaching out to HELLO! Clothing. Our Colombo support concierge has received your message and will respond within 24 hours.
                  </p>
                  <div style="background: #1c1d1d; border-radius: 6px; padding: 12px; margin-top: 12px; font-size: 13px; color: #888888; font-style: italic;">
                    "${message}"
                  </div>
                </td>
              </tr>
              <tr>
                <td style="border-top: 1px solid #262727; padding-top: 16px; font-size: 11px; color: #666666; text-align: center;">
                  HELLO! Support Concierge &middot; <a href="mailto:support@helloclothing.store" style="color: #888888;">support@helloclothing.store</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  // 2. Alert to Support team
  const adminHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <body style="${baseEmailStyle}">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; background: #141515; border: 1px solid #262727; border-radius: 8px; color: #ededed;">
        <h3 style="color: #38bdf8; margin: 0 0 10px;">📨 New Customer Inquiry (${inquiryRef})</h3>
        <p><strong>From:</strong> ${name} (&lt;${email}&gt;)</p>
        <div style="background: #1c1d1d; padding: 14px; border-radius: 6px; font-size: 14px; line-height: 1.5; color: #ffffff;">
          ${message.replace(/\n/g, '<br>')}
        </div>
        <p style="margin-top: 14px;"><a href="mailto:${email}" style="color: #4ade80; font-weight: 700;">Click to Reply directly to ${name}</a></p>
      </div>
    </body>
    </html>
  `;

  if (!resend) {
    console.log(`[Resend Mock] Contact emails simulated for ${name} <${email}>`);
    return { success: true, simulated: true };
  }

  try {
    await Promise.allSettled([
      resend.emails.send({
        from: EMAIL_FROM.support,
        to: email,
        subject: `We've received your inquiry (${inquiryRef}) — HELLO! Support`,
        html: customerHtml,
      }),
      resend.emails.send({
        from: EMAIL_FROM.support,
        to: 'support@helloclothing.store',
        subject: `📨 Customer Inquiry from ${name} (${inquiryRef})`,
        html: adminHtml,
      }),
    ]);
    return { success: true };
  } catch (err: any) {
    console.error(`[Resend Error] Contact email sending failed:`, err);
    return { success: false, error: err?.message };
  }
}

/**
 * 5. VIP Drop Alerts & Newsletter Welcome (from drops@helloclothing.store)
 */
export async function sendDropWelcomeEmail(email: string) {
  const resend = getResendClient();
  const cleanEmail = email.trim().toLowerCase();

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <title>Welcome to HELLO! Drops</title>
    </head>
    <body style="${baseEmailStyle}">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #0c0d0d; padding: 30px 15px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 580px; background-color: #141515; border: 1px solid #262727; border-radius: 12px; padding: 32px 28px; color: #ededed;">
              <tr>
                <td style="border-bottom: 1px solid #262727; padding-bottom: 20px;">
                  <span style="font-size: 26px; font-weight: 900; letter-spacing: 2px; color: #ffffff; display: block;">HELLO!</span>
                  <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #f59e0b;">VIP DROP ALERTS & RESTOCKS</span>
                </td>
              </tr>
              <tr>
                <td style="padding: 24px 0 16px;">
                  <span style="display: inline-block; background: #451a03; border: 1px solid #92400e; color: #fbbf24; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 4px; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 12px;">MEMBER EXCLUSIVE</span>
                  <h1 style="color: #ffffff; font-size: 22px; font-weight: 800; margin: 0 0 10px; letter-spacing: -0.5px;">YOU'RE ON THE LIST.</h1>
                  <p style="color: #aaaaaa; font-size: 14px; line-height: 1.6; margin: 0 0 20px;">
                    Welcome to the HELLO! streetwear community. You now get priority notifications 30 minutes before any limited capsule or heavyweight restock goes public.
                  </p>
                  
                  <div style="background: #1c1d1d; border: 1px solid #2e3030; border-radius: 8px; padding: 18px; text-align: center;">
                    <div style="font-size: 11px; color: #888888; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">Your 10% Welcome Discount</div>
                    <div style="font-size: 24px; font-weight: 900; letter-spacing: 3px; color: #4ade80;">HELLO10</div>
                    <div style="font-size: 12px; color: #666666; margin-top: 6px;">Enter at checkout for 10% off your entire first haul.</div>
                  </div>
                </td>
              </tr>
              <tr>
                <td style="padding-top: 20px; text-align: center;">
                  <a href="https://www.helloclothing.store/shop" target="_blank" style="display: inline-block; background-color: #ffffff; color: #000000; font-size: 13px; font-weight: 800; letter-spacing: 0.5px; text-decoration: none; padding: 14px 28px; border-radius: 6px; text-transform: uppercase;">
                    Shop Live Vault &rarr;
                  </a>
                </td>
              </tr>
              <tr>
                <td style="padding-top: 36px; border-top: 1px solid #262727; margin-top: 28px; font-size: 11px; color: #666666; line-height: 1.6; text-align: center;">
                  HELLO! Clothing Sri Lanka &middot; Heavyweight Streetwear<br>
                  Sent by <a href="mailto:drops@helloclothing.store" style="color: #888888;">drops@helloclothing.store</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  if (!resend) {
    console.log(`[Resend Mock] Drop welcome simulated to: ${cleanEmail}`);
    return { success: true, simulated: true };
  }

  try {
    const data = await resend.emails.send({
      from: EMAIL_FROM.drops,
      to: cleanEmail,
      subject: `🔥 VIP Access Unlocked: 10% Off Your First Haul — HELLO!`,
      html,
    });
    return { success: true, data };
  } catch (err: any) {
    console.error(`[Resend Error] Drop welcome failed:`, err);
    return { success: false, error: err?.message };
  }
}

