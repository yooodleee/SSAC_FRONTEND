import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * POST /api/v1/admin/contents/upload-image
 * 이미지 업로드 (multipart/form-data)
 */
export async function POST(request: NextRequest) {
  const backendUrl = process.env.API_BASE_URL;
  if (!backendUrl) {
    return NextResponse.json({ message: 'API_BASE_URL 미설정' }, { status: 500 });
  }

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value ?? null;

    const formData = await request.formData();
    const url = new URL('/api/v1/admin/contents/upload-image', backendUrl);
    const beRes = await fetch(url.toString(), {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
      cache: 'no-store',
    });

    const data = (await beRes.json().catch(() => ({}))) as unknown;
    return NextResponse.json(data, { status: beRes.status });
  } catch {
    return NextResponse.json({ message: '서버 오류' }, { status: 500 });
  }
}
