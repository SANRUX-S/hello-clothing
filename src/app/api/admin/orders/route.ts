import { NextResponse } from 'next/server';
import { getOrdersFromDb, updateOrderStatusInDb } from '@/lib/server/db';
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
    const { reference, status, courier, trackingNumber } = data;
    if (!reference || !status) {
      return NextResponse.json({ error: 'Order reference and status are required' }, { status: 400, headers: privateHeaders });
    }
    await updateOrderStatusInDb(reference, status, courier, trackingNumber);
    return NextResponse.json({ success: true }, { headers: privateHeaders });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update order status' }, { status: 500, headers: privateHeaders });
  }
}
