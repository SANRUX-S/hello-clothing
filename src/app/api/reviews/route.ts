import { NextResponse } from 'next/server';
import { getPublishedReviews, saveReview } from '@/lib/server/db';
import { publicCacheHeaders } from '@/lib/server/http';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const reviews = await getPublishedReviews();
    return NextResponse.json({ success: true, reviews }, { headers: publicCacheHeaders });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { author, location, rating, title, body: reviewBody, image } = body;

    if (!author || !title || !reviewBody) {
      return NextResponse.json({ error: 'Author, title, and review body are required.' }, { status: 400 });
    }

    const reviewId = `rev-${Date.now()}`;
    const newReview = await saveReview({
      id: reviewId,
      author: String(author).trim().slice(0, 100),
      location: String(location || 'Sri Lanka').trim().slice(0, 100),
      rating: Math.min(5, Math.max(1, Number(rating) || 5)),
      title: String(title).trim().slice(0, 200),
      body: String(reviewBody).trim().slice(0, 1500),
      image: image || '/campaign/real/couple-graphic-tees.webp',
      status: 'published',
    });

    return NextResponse.json({ success: true, review: newReview }, { status: 201 });
  } catch (err: any) {
    console.error('Error submitting review:', err);
    return NextResponse.json({ error: err.message || 'Failed to save review to database.' }, { status: 500 });
  }
}
