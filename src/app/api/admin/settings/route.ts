import { NextResponse } from 'next/server';
import { getStoreSettingFromDb, saveStoreSettingToDb } from '@/lib/server/db';
import { privateHeaders } from '@/lib/server/http';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');

    if (key) {
      const data = await getStoreSettingFromDb(key);
      return NextResponse.json({ [key]: data }, { headers: privateHeaders });
    }

    const [settings, content] = await Promise.all([
      getStoreSettingFromDb('store_settings'),
      getStoreSettingFromDb('store_content'),
    ]);

    return NextResponse.json({ settings, content }, { headers: privateHeaders });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch settings' }, { status: 500, headers: privateHeaders });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { key, value } = body;

    if (!key || value === undefined) {
      return NextResponse.json({ error: 'Key and value are required' }, { status: 400, headers: privateHeaders });
    }

    await saveStoreSettingToDb(key, value);
    return NextResponse.json({ success: true, key }, { headers: privateHeaders });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to save settings' }, { status: 500, headers: privateHeaders });
  }
}
