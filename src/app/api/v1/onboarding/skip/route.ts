import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * BFF — POST /api/v1/onboarding/skip
 * 온보딩 건너뛰기 요청을 BE로 전달하고 기본 레벨(씨앗)을 반환한다.
 */
export async function POST(): Promise<Response> {
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
    const upstream = await fetch(`${apiBaseUrl}/api/v1/onboarding/skip`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await upstream.json();
    return NextResponse.json(body, { status: upstream.status });
  } catch {
    return NextResponse.json({ errorCode: 'SERVER_ERROR' }, { status: 500 });
  }
}
