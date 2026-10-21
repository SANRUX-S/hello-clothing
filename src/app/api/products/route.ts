import { NextResponse } from 'next/server';
import { getProductsFromDb } from '@/lib/server/db';
import { publicCacheHeaders } from '@/lib/server/http';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const products = await getProductsFromDb();
    return NextResponse.json({ products }, { headers: publicCacheHeaders });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch catalog' }, { status: 500 });
  }
}
