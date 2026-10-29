import { NextResponse } from 'next/server';
import { getProductsFromDb, saveProductToDb, deleteProductFromDb } from '@/lib/server/db';
import { privateHeaders } from '@/lib/server/http';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const products = await getProductsFromDb();
    return NextResponse.json({ products }, { headers: privateHeaders });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch products' }, { status: 500, headers: privateHeaders });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    if (!data.name) {
      return NextResponse.json({ error: 'Product name is required' }, { status: 400, headers: privateHeaders });
    }
    const id = data.id || `prod-${Date.now()}`;
    await saveProductToDb({ ...data, id });
    return NextResponse.json({ success: true, id }, { headers: privateHeaders });
  } catch (err: any) {
    console.error('POST /api/admin/products error:', err);
    return NextResponse.json({ error: err.message || 'Failed to save product' }, { status: 500, headers: privateHeaders });
  }
}

export async function PUT(req: Request) {
  try {
    const data = await req.json();
    if (!data.id || !data.name) {
      return NextResponse.json({ error: 'Product id and name are required' }, { status: 400, headers: privateHeaders });
    }
    await saveProductToDb(data);
    return NextResponse.json({ success: true }, { headers: privateHeaders });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update product' }, { status: 500, headers: privateHeaders });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Product id is required' }, { status: 400, headers: privateHeaders });
    }
    await deleteProductFromDb(id);
    return NextResponse.json({ success: true }, { headers: privateHeaders });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete product' }, { status: 500, headers: privateHeaders });
  }
}
