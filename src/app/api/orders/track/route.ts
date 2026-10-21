import { NextResponse } from 'next/server';
import { getOrderFromDb } from '@/lib/server/db';
import { privateHeaders } from '@/lib/server/http';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const ref = (searchParams.get('ref') || searchParams.get('code') || '').trim();
  if (!ref) {
    return NextResponse.json({ error: 'Order reference is required' }, { status: 400, headers: privateHeaders });
  }

  const order = await getOrderFromDb(ref);
  if (!order) {
    return NextResponse.json({ error: 'No order found with this reference. Please check your reference code or receipt.' }, { status: 404, headers: privateHeaders });
  }

  return NextResponse.json({ order }, { headers: privateHeaders });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const ref = body.reference || body.ref;
    if (!ref) {
      return NextResponse.json({ error: 'Order reference is required' }, { status: 400, headers: privateHeaders });
    }

    const order = await getOrderFromDb(ref);
    if (!order) {
      return NextResponse.json({ error: 'No order found with this reference. Please check your reference code or receipt.' }, { status: 404, headers: privateHeaders });
    }

    return NextResponse.json({ order }, { headers: privateHeaders });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Tracking lookup failed' }, { status: 500, headers: privateHeaders });
  }
}
