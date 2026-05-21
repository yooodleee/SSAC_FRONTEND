import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * GET /api/v1/admin/home
 * 관리자 홈 데이터 (admin 정보 + 통계)
 */
export async function GET() {
  const backendUrl = process.env.API_BASE_URL;

  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value ?? null;

  if (!backendUrl) {
    return NextResponse.json({
      admin: { nickname: '관리자', role: 'ADMIN' },
      stats: { totalUsers: 0, totalFeedbacks: 0 },
    });
  }

  try {
    const beResponse = await fetch(new URL('/api/v1/admin/home', backendUrl).toString(), {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: 'no-store',
    });

    if (!beResponse.ok) {
      const errorData = (await beResponse.json().catch(() => ({}))) as {
        code?: string;
        message?: string;
      };
      return NextResponse.json(
        { errorCode: errorData.code ?? 'ADMIN-002' },
        { status: beResponse.status },
      );
    }

    const data = (await beResponse.json().catch(() => ({}))) as unknown;
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ errorCode: 'SERVER_ERROR' }, { status: 500 });
  }
}
