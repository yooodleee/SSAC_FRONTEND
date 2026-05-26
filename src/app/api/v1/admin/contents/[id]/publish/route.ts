import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * POST /api/v1/admin/contents/[id]/publish
 * 콘텐츠 게시
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const backendUrl = process.env.API_BASE_URL;
  const { id } = await params;
  if (!backendUrl) {
    return NextResponse.json({ message: 'API_BASE_URL 미설정' }, { status: 500 });
  }

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value ?? null;

    const body = (await request.json().catch(() => ({}))) as unknown;
    const url = new URL(`/api/v1/admin/contents/${id}/publish`, backendUrl);
    const beRes = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    const data = (await beRes.json().catch(() => ({}))) as unknown;
    return NextResponse.json(data, { status: beRes.status });
  } catch {
    return NextResponse.json({ message: '서버 오류' }, { status: 500 });
  }
}
