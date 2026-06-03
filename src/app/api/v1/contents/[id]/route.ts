import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * BFF — GET /api/v1/contents/[id]
 * 콘텐츠 상세 조회. 비로그인 사용자도 접근 가능 (accessToken 선택 전달).
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await params;
  const backendUrl = process.env.API_BASE_URL;

  if (!backendUrl) {
    return NextResponse.json({ errorCode: 'SERVER_ERROR' }, { status: 500 });
  }

  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;
  const authHeader: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

  try {
    const upstream = await fetch(`${backendUrl}/api/v1/contents/${id}`, {
      headers: authHeader,
      cache: 'no-store',
    });

    const body = (await upstream.json()) as Record<string, unknown>;
    return NextResponse.json(body, { status: upstream.status });
  } catch {
    return NextResponse.json({ errorCode: 'SERVER_ERROR' }, { status: 500 });
  }
}
