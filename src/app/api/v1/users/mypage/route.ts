import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * BFF — GET /api/v1/users/mypage (FE 내부 경로)
 * 실제 BE 호출 경로: GET /api/v1/users/me (ProfileController → UserService.getMyPage())
 * BE의 /users/mypage 엔드포인트 제거로 인해 /users/me로 위임됨.
 */
export async function GET(): Promise<Response> {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;
  const apiBaseUrl = process.env.API_BASE_URL;

  if (!apiBaseUrl) {
    return NextResponse.json({ errorCode: 'SERVER_ERROR' }, { status: 500 });
  }

  if (!token) {
    return NextResponse.json({ errorCode: 'AUTH-001', loginRequired: true }, { status: 401 });
  }

  try {
    const upstream = await fetch(`${apiBaseUrl}/api/v1/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });

    const body = (await upstream.json()) as Record<string, unknown>;
    return NextResponse.json(body, { status: upstream.status });
  } catch {
    return NextResponse.json({ errorCode: 'SERVER_ERROR' }, { status: 500 });
  }
}
