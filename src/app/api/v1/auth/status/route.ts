import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * GET /api/v1/auth/status
 * 현재 인증 상태와 role을 반환한다.
 */
export async function GET() {
  const backendUrl = process.env.API_BASE_URL;

  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value ?? null;

  if (!backendUrl) {
    // 로컬 개발: 토큰이 있으면 USER로 처리
    if (!token) {
      return NextResponse.json({ isAuthenticated: false, role: null, redirectTo: '/login' });
    }
    return NextResponse.json({ isAuthenticated: true, role: 'USER', redirectTo: '/home' });
  }

  try {
    const beResponse = await fetch(new URL('/api/v1/auth/status', backendUrl).toString(), {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: 'no-store',
    });

    const data = (await beResponse.json().catch(() => ({}))) as unknown;
    return NextResponse.json(data, { status: beResponse.status });
  } catch {
    return NextResponse.json({ errorCode: 'SERVER_ERROR' }, { status: 500 });
  }
}
