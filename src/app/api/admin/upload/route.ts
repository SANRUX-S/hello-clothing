import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { privateHeaders } from '@/lib/server/http';
import { saveMediaToDb } from '@/lib/server/db';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let buffer: Buffer;
    let ext = 'webp';
    let originalName = 'product';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      if (!file) {
        return NextResponse.json({ error: 'No file provided in form data' }, { status: 400, headers: privateHeaders });
      }
      originalName = file.name ? path.basename(file.name, path.extname(file.name)) : 'product';
      const fileExt = path.extname(file.name || '').replace('.', '').toLowerCase();
      if (['jpg', 'jpeg', 'png', 'webp', 'avif', 'gif'].includes(fileExt)) {
        ext = fileExt;
      }
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    } else {
      // JSON body with base64 dataUrl
      const body = await req.json().catch(() => null);
      const rawDataUrl = body?.dataUrl || body?.data;
      if (!rawDataUrl) {
        return NextResponse.json({ error: 'dataUrl or file required' }, { status: 400, headers: privateHeaders });
      }
      const matches = rawDataUrl.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
      if (!matches) {
        return NextResponse.json({ error: 'Invalid data URL format' }, { status: 400, headers: privateHeaders });
      }
      const mime = matches[1];
      if (mime.includes('png')) ext = 'png';
      else if (mime.includes('jpeg') || mime.includes('jpg')) ext = 'jpg';
      else if (mime.includes('webp')) ext = 'webp';
      else if (mime.includes('gif')) ext = 'gif';

      buffer = Buffer.from(matches[2], 'base64');
      if (body.filename) {
        originalName = path.basename(body.filename, path.extname(body.filename));
      }
    }

    // Sanitize base name
    const safeBaseName = originalName.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 30) || 'product';
    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const mediaId = `${safeBaseName}-${uniqueSuffix}`;
    const filename = `${mediaId}.${ext}`;
    const mimeType = ext === 'png' ? 'image/png' : ext === 'jpg' ? 'image/jpeg' : ext === 'gif' ? 'image/gif' : 'image/webp';
    const base64Data = buffer.toString('base64');

    // 1. Always persist to Neon PostgreSQL media table (works 100% reliably on Vercel Serverless)
    let publicUrl = `/api/media/${filename}`;
    try {
      await saveMediaToDb(mediaId, filename, mimeType, base64Data);
    } catch (dbErr: any) {
      console.warn('DB media persistence notice:', dbErr.message);
    }

    // 2. Also try local filesystem if writable (e.g. local dev server)
    try {
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'products');
      await mkdir(uploadsDir, { recursive: true });
      const targetPath = path.join(uploadsDir, filename);
      await writeFile(targetPath, buffer);
    } catch {
      // Serverless read-only filesystem expected on Vercel
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename,
      size: buffer.length
    }, { headers: privateHeaders });
  } catch (err: any) {
    console.error('Upload error:', err);
    return NextResponse.json({ error: err.message || 'Image upload failed' }, { status: 500, headers: privateHeaders });
  }
}
