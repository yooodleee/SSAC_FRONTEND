import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * BFF — GET /api/v1/home
 * 홈 화면 데이터를 반환한다.
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
    const upstream = await fetch(`${apiBaseUrl}/api/v1/home`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });

    const body = (await upstream.json()) as Record<string, unknown>;

    return NextResponse.json(body, { status: upstream.status });
  } catch {
    return NextResponse.json({ errorCode: 'SERVER_ERROR' }, { status: 500 });
  }
}
