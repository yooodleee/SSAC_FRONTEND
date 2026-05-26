import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

async function getAuthHeader(): Promise<Record<string, string>> {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value ?? null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * GET /api/v1/admin/contents?page=1&size=50
 * 콘텐츠 목록 조회
 */
export async function GET(request: NextRequest) {
  const backendUrl = process.env.API_BASE_URL;
  if (!backendUrl) {
    return NextResponse.json({ data: { totalCount: 0, contents: [] } });
  }

  try {
    const { searchParams } = request.nextUrl;
    const url = new URL('/api/v1/admin/contents', backendUrl);
    searchParams.forEach((v, k) => url.searchParams.set(k, v));

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
 * POST /api/v1/admin/contents
 * 콘텐츠 생성
 */
export async function POST() {
  const backendUrl = process.env.API_BASE_URL;
  if (!backendUrl) {
    return NextResponse.json({ message: 'API_BASE_URL 미설정' }, { status: 500 });
  }

  try {
    const url = new URL('/api/v1/admin/contents', backendUrl);
    const beRes = await fetch(url.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(await getAuthHeader()) },
      cache: 'no-store',
    });

    const data = (await beRes.json().catch(() => ({}))) as unknown;
    return NextResponse.json(data, { status: beRes.status });
  } catch {
    return NextResponse.json({ message: '서버 오류' }, { status: 500 });
  }
}
