import { NextResponse } from 'next/server';
import { getOrdersFromDb, getOrderFromDb, createOrderInDb, updateOrderStatusInDb, deleteOrderFromDb, deleteAllOrdersFromDb } from '@/lib/server/db';
import { sendOrderStatusUpdateEmail, sendOrderConfirmationEmail } from '@/lib/server/mail';
import { privateHeaders } from '@/lib/server/http';
import { randomBytes } from 'node:crypto';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const orders = await getOrdersFromDb();
    return NextResponse.json({ orders }, { headers: privateHeaders });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch orders' }, { status: 500, headers: privateHeaders });
  }
}

export async function PATCH(req: Request) {
  try {
    const data = await req.json();
    const { reference, status, courier, trackingNumber, notifyCustomer = true } = data;
    if (!reference || !status) {
      return NextResponse.json({ error: 'Order reference and status are required' }, { status: 400, headers: privateHeaders });
    }

    const previousOrder = await getOrderFromDb(reference);
    await updateOrderStatusInDb(reference, status, courier, trackingNumber);

    // Asynchronously notify customer of status change via Resend (orders@helloclothing.store)
    if (notifyCustomer && previousOrder && previousOrder.customer?.email) {
      sendOrderStatusUpdateEmail({
        reference,
        status,
        courier: courier || previousOrder.courier,
        tracking_number: trackingNumber || previousOrder.tracking_number,
        customer: previousOrder.customer,
      }).catch((err) => console.error('[Resend] Status email background error:', err));
    }

    return NextResponse.json({ success: true }, { headers: privateHeaders });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update order status' }, { status: 500, headers: privateHeaders });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { reference, action } = data;

    // 1. Clear demo / test orders
    if (action === 'clear_demo') {
      // Remove known dummy/sample order(s)
      await deleteOrderFromDb('HL-782914').catch(() => {});
      return NextResponse.json({ success: true, message: 'Demo orders purged from database.' }, { headers: privateHeaders });
    }

    // 2. Create manual order directly in database
    if (action === 'create' || (!action && (data.customer || data.order?.customer))) {
      const payload = data.order || data;
      const randomHex = randomBytes(3).toString('hex').toUpperCase();
      const orderRef = payload.reference || reference || `HL-${randomHex}`;
      const customer = payload.customer || {
        name: 'Walk-in Customer',
        email: 'customer@helloclothing.store',
        phone: '077 000 0000',
        address: 'Direct Pickup / In-Store',
        city: 'Colombo',
      };
      const items = Array.isArray(payload.items) ? payload.items : [];
      const subtotal = Number(payload.subtotal) || items.reduce((s: number, i: any) => s + (Number(i.lineTotal) || (Number(i.unitPrice) * Number(i.quantity))), 0);
      const delivery = Number(payload.delivery) !== undefined ? Number(payload.delivery) : 50000;
      const total = Number(payload.total) || (subtotal + delivery);
      const paymentMethod = payload.paymentMethod || payload.payment_method || 'cod';
      const status = payload.status || 'confirmed';
      const courier = payload.courier || 'PromptX Logistics';
      const trackingNumber = payload.tracking_number || payload.trackingNumber || `PX-${randomHex}`;
      const notes = payload.notes || 'Created via Admin Portal';

      await createOrderInDb({
        reference: orderRef,
        customer,
        items,
        subtotal,
        delivery,
        total,
        payment_method: paymentMethod,
        status,
        courier,
        tracking_number: trackingNumber,
        notes,
      });

      return NextResponse.json({ success: true, reference: orderRef }, { headers: privateHeaders });
    }

    // 3. Resend confirmation receipt
    if (!reference) {
      return NextResponse.json({ error: 'Order reference is required' }, { status: 400, headers: privateHeaders });
    }

    const order = await getOrderFromDb(reference);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404, headers: privateHeaders });
    }

    if (action === 'resend_confirmation') {
      const result = await sendOrderConfirmationEmail(order);
      return NextResponse.json({ success: true, result }, { headers: privateHeaders });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400, headers: privateHeaders });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Action failed' }, { status: 500, headers: privateHeaders });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    let reference = searchParams.get('reference');
    if (!reference) {
      try {
        const body = await req.json();
        reference = body?.reference;
      } catch {}
    }

    if (!reference) {
      return NextResponse.json({ error: 'Order reference is required' }, { status: 400, headers: privateHeaders });
    }

    if (reference === 'ALL') {
      await deleteAllOrdersFromDb();
      return NextResponse.json({ success: true, message: 'All orders cleared' }, { headers: privateHeaders });
    }

    await deleteOrderFromDb(reference);
    return NextResponse.json({ success: true, reference }, { headers: privateHeaders });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete order' }, { status: 500, headers: privateHeaders });
  }
}
