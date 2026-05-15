import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * BFF — DELETE /api/v1/onboarding/result
 * 온보딩 결과를 초기화하여 재응시할 수 있게 한다.
 */
export async function DELETE(): Promise<Response> {
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
    const upstream = await fetch(`${apiBaseUrl}/api/v1/onboarding/result`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (upstream.status === 204) {
      return NextResponse.json({ success: true, data: null });
    }

    const responseBody = (await upstream.json().catch(() => ({}))) as Record<string, unknown>;
    return NextResponse.json(responseBody, { status: upstream.status });
  } catch {
    return NextResponse.json({ errorCode: 'SERVER_ERROR' }, { status: 500 });
  }
}

/**
 * BFF — GET /api/v1/onboarding/result
 * 온보딩 레벨 판정 결과를 반환한다.
 * BE 응답에 users/me 닉네임을 병합하여 반환한다.
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
    const [resultRes, meRes] = await Promise.allSettled([
      fetch(`${apiBaseUrl}/api/v1/onboarding/result`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      }),
      fetch(`${apiBaseUrl}/api/v1/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      }),
    ]);

    if (resultRes.status === 'rejected') {
      return NextResponse.json({ errorCode: 'SERVER_ERROR' }, { status: 500 });
    }

    const resultUpstream = resultRes.value;
    const resultBody = (await resultUpstream.json()) as Record<string, unknown>;

    if (!resultUpstream.ok) {
      return NextResponse.json(resultBody, { status: resultUpstream.status });
    }

    let nickname: string | undefined;
    if (meRes.status === 'fulfilled' && meRes.value.ok) {
      const meBody = (await meRes.value.json()) as { data?: { nickname?: string } };
      nickname = meBody?.data?.nickname;
    }

    const data = (resultBody['data'] ?? resultBody) as Record<string, unknown>;
    return NextResponse.json({ success: true, data: { ...data, nickname } });
  } catch {
    return NextResponse.json({ errorCode: 'SERVER_ERROR' }, { status: 500 });
  }
}
