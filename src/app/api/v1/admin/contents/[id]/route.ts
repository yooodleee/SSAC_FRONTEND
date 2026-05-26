import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

async function getAuthHeader(): Promise<Record<string, string>> {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value ?? null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * GET /api/v1/admin/contents/[id]
 * 콘텐츠 단건 조회
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const backendUrl = process.env.API_BASE_URL;
  const { id } = await params;
  if (!backendUrl) {
    return NextResponse.json({ data: {} });
  }

  try {
    const url = new URL(`/api/v1/admin/contents/${id}`, backendUrl);
    const beRes = await fetch(url.toString(), {
      headers: await getAuthHeader(),
      cache: 'no-store',
    });

    const data = (await beRes.json().catch(() => ({}))) as unknown;
    return NextResponse.json(data, { status: beRes.status });
  } catch {
    return NextResponse.json({ message: '서버 오류' }, { status: 500 });
  }
}

/**
 * PATCH /api/v1/admin/contents/[id]
 * 콘텐츠 수정
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const backendUrl = process.env.API_BASE_URL;
  const { id } = await params;
  if (!backendUrl) {
    return NextResponse.json({ message: 'API_BASE_URL 미설정' }, { status: 500 });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as unknown;
    const url = new URL(`/api/v1/admin/contents/${id}`, backendUrl);
    const beRes = await fetch(url.toString(), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...(await getAuthHeader()) },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    const data = (await beRes.json().catch(() => ({}))) as unknown;
    return NextResponse.json(data, { status: beRes.status });
  } catch {
    return NextResponse.json({ message: '서버 오류' }, { status: 500 });
  }
}
