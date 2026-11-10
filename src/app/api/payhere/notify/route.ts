import { NextResponse } from 'next/server';
import { verifyPayHereNotification } from '@/lib/server/payhere';
import { markOrderPaidInDb, getOrderFromDb } from '@/lib/server/db';
import { sendOrderConfirmationEmail, sendAdminNewOrderAlert } from '@/lib/server/mail';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const merchant_id = String(formData.get('merchant_id') || '');
    const order_id = String(formData.get('order_id') || '');
    const payment_id = String(formData.get('payment_id') || '');
    const payhere_amount = String(formData.get('payhere_amount') || '');
    const payhere_currency = String(formData.get('payhere_currency') || '');
    const status_code = String(formData.get('status_code') || '');
    const md5sig = String(formData.get('md5sig') || '');
    const method = String(formData.get('method') || 'CARD');
    const status_message = String(formData.get('status_message') || '');

    const isValid = verifyPayHereNotification({
      merchant_id,
      order_id,
      payhere_amount,
      payhere_currency,
      status_code,
      md5sig,
    });

    if (!isValid) {
      console.warn(`[PayHere Notify] Invalid MD5 signature for Order: ${order_id}`);
      return new Response('Invalid Signature', { status: 400 });
    }

    console.log(`[PayHere Notify] Verified IPN for Order ${order_id}: status_code=${status_code}, payment_id=${payment_id}, method=${method}`);

    // Status 2 = Success in PayHere
    if (status_code === '2') {
      await markOrderPaidInDb(order_id, payment_id, method);

      // Trigger automatic transactional emails
      try {
        const order = await getOrderFromDb(order_id);
        if (order) {
          Promise.allSettled([
            sendOrderConfirmationEmail({
              reference: order.reference,
              customer: order.customer,
              items: order.items,
              subtotal: order.subtotal,
              delivery: order.delivery,
              total: order.total,
              paymentMethod: 'card',
            }),
            sendAdminNewOrderAlert({
              reference: order.reference,
              customer: order.customer,
              items: order.items,
              total: order.total,
              paymentMethod: 'card',
            }),
          ]).catch(err => console.error('[PayHere Notify] Email sending error:', err));
        }
      } catch (mailErr) {
        console.error('[PayHere Notify] Failed to fetch order for emails:', mailErr);
      }
    }

    // PayHere requires HTTP 200 with OK
    return new Response('OK', { status: 200 });
  } catch (err: any) {
    console.error('[PayHere Notify] Error processing IPN:', err);
    return new Response(err?.message || 'Internal Error', { status: 500 });
  }
}
