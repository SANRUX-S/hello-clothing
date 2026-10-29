import { NextRequest, NextResponse } from 'next/server';
import { getMediaFromDb } from '@/lib/server/db';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return new NextResponse('Media ID is required', { status: 400 });
    }

    const media = await getMediaFromDb(id);
    if (!media) {
      return new NextResponse('Media not found', { status: 404 });
    }

    return new NextResponse(new Uint8Array(media.buffer), {
      status: 200,
      headers: {
        'Content-Type': media.mimeType || 'image/webp',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (err: any) {
    console.error('Media retrieval error:', err);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
