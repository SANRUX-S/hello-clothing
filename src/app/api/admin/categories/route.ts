import { NextResponse } from 'next/server';
import { staffOnly, isSameOrigin } from '@/lib/firebase/server';
import { getCategoriesFromDb, saveCategoryToDb, deleteCategoryFromDb } from '@/lib/server/db';
import { privateHeaders } from '@/lib/server/http';

export const dynamic = 'force-dynamic';

export async function GET() {
  const denied = await staffOnly();
  if (denied) return denied;

  try {
    const categories = await getCategoriesFromDb();
    return NextResponse.json({ categories }, { headers: privateHeaders });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch categories' }, { status: 500, headers: privateHeaders });
  }
}

export async function POST(req: Request) {
  const denied = await staffOnly();
  if (denied) return denied;
  if (!isSameOrigin(req)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });

  try {
    const data = await req.json();
    if (!data.name || !data.slug) {
      return NextResponse.json({ error: 'Category name and slug are required' }, { status: 400, headers: privateHeaders });
    }
    await saveCategoryToDb(data);
    return NextResponse.json({ success: true }, { headers: privateHeaders });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to save category' }, { status: 500, headers: privateHeaders });
  }
}

export async function DELETE(req: Request) {
  const denied = await staffOnly();
  if (denied) return denied;
  if (!isSameOrigin(req)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });

  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');
    if (!slug) {
      return NextResponse.json({ error: 'Category slug is required' }, { status: 400, headers: privateHeaders });
    }
    await deleteCategoryFromDb(slug);
    return NextResponse.json({ success: true }, { headers: privateHeaders });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete category' }, { status: 500, headers: privateHeaders });
  }
}
