import { NextResponse } from 'next/server';
import { getOrdersFromDb, getOrderFromDb, updateOrderStatusInDb } from '@/lib/server/db';
import { sendOrderStatusUpdateEmail, sendOrderConfirmationEmail } from '@/lib/server/mail';
import { privateHeaders } from '@/lib/server/http';

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
    if (notifyCustomer && previousOrder) {
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
