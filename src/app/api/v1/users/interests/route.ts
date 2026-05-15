import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * BFF — PUT /api/v1/users/interests
 * 관심 도메인을 수정한다. 1~3개 선택 필수, 기존 데이터를 덮어쓴다.
 * BE 204 응답을 { success: true } 200으로 변환하여 클라이언트 처리를 단순화한다.
 */
export async function PUT(request: NextRequest): Promise<Response> {
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
    const upstream = await fetch(`${apiBaseUrl}/api/v1/users/interests`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
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
