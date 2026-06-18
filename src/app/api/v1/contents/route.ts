import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * BFF — GET /api/v1/contents
 * 콘텐츠 목록 조회. 비로그인 사용자도 접근 가능 (accessToken 선택 전달).
 */
export async function GET(request: NextRequest): Promise<Response> {
  const backendUrl = process.env.API_BASE_URL;

  if (!backendUrl) {
    return NextResponse.json({ errorCode: 'SERVER_ERROR' }, { status: 500 });
  }

  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;
  const authHeader: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

  try {
    const url = new URL('/api/v1/contents', backendUrl);
    request.nextUrl.searchParams.forEach((v, k) => url.searchParams.set(k, v));

    const upstream = await fetch(url.toString(), {
      headers: authHeader,
      cache: 'no-store',
    });

    const body = (await upstream.json()) as Record<string, unknown>;
    return NextResponse.json(body, { status: upstream.status });
  } catch {
    return NextResponse.json({ errorCode: 'SERVER_ERROR' }, { status: 500 });
  }
}
