import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * BFF — PATCH /api/v1/users/profile (FE 내부 경로)
 * 실제 BE 호출 경로: PATCH /api/v1/users/profile
 */
export async function PATCH(request: NextRequest): Promise<Response> {
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
    const body = (await request.json()) as Record<string, unknown>;
    const upstream = await fetch(`${apiBaseUrl}/api/v1/users/profile`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    const data = (await upstream.json()) as Record<string, unknown>;
    return NextResponse.json(data, { status: upstream.status });
  } catch {
    return NextResponse.json({ errorCode: 'SERVER_ERROR' }, { status: 500 });
  }
}
