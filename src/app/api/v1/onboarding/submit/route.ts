import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * BFF — POST /api/v1/onboarding/submit
 * 온보딩 답안을 BE로 전달하고 레벨 결과를 반환한다.
 */
export async function POST(request: NextRequest): Promise<Response> {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;
  const apiBaseUrl = process.env.API_BASE_URL;

  if (!apiBaseUrl) {
    return NextResponse.json({ errorCode: 'SERVER_ERROR' }, { status: 500 });
  }

  if (!token) {
    return NextResponse.json({ errorCode: 'AUTH-001', loginRequired: true }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ errorCode: 'COMMON-002' }, { status: 400 });
  }

  try {
    const upstream = await fetch(`${apiBaseUrl}/api/v1/onboarding/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
    const responseBody = await upstream.json();
    return NextResponse.json(responseBody, { status: upstream.status });
  } catch {
    return NextResponse.json({ errorCode: 'SERVER_ERROR' }, { status: 500 });
  }
}
