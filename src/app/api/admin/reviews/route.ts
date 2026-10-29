import { NextResponse } from 'next/server';
import { getAllReviews, saveReview, deleteReview } from '@/lib/server/db';
import { privateHeaders } from '@/lib/server/http';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const reviews = await getAllReviews();
    return NextResponse.json({ success: true, reviews }, { headers: privateHeaders });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch reviews' }, { status: 500, headers: privateHeaders });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    if (!data.author || !data.body || !data.title) {
      return NextResponse.json({ error: 'Author, title, and review body are required' }, { status: 400, headers: privateHeaders });
    }

    await saveReview({
      id: data.id,
      author: data.author,
      location: data.location,
      rating: Number(data.rating) || 5,
      title: data.title,
      body: data.body,
      image: data.image,
      status: data.status || 'published'
    });

    return NextResponse.json({ success: true }, { headers: privateHeaders });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to save review' }, { status: 500, headers: privateHeaders });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Review id is required' }, { status: 400, headers: privateHeaders });
    }

    await deleteReview(id);
    return NextResponse.json({ success: true }, { headers: privateHeaders });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete review' }, { status: 500, headers: privateHeaders });
  }
}

