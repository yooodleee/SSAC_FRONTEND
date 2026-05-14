import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * BFF — GET /api/v1/onboarding/questions
 * accessToken 쿠키를 읽어 BE로 프록시한다.
 * BE 응답(성공/에러)을 그대로 전달하여 클라이언트가 errorCode를 처리할 수 있게 한다.
 */
export async function GET(): Promise<Response> {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;
  const apiBaseUrl = process.env.API_BASE_URL;

  if (!apiBaseUrl) {
    return NextResponse.json({ errorCode: 'SERVER_ERROR' }, { status: 500 });
  }

  try {
    const upstream = await fetch(`${apiBaseUrl}/api/v1/onboarding/questions`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: 'no-store',
    });
    const body = await upstream.json();
    return NextResponse.json(body, { status: upstream.status });
  } catch {
    return NextResponse.json({ errorCode: 'SERVER_ERROR' }, { status: 500 });
  }
}
