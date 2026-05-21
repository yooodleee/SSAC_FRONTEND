import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * GET /api/v1/admin/feedbacks?status=PENDING|IN_PROGRESS|DONE&page=1&size=20
 * 피드백 목록 조회
 */
export async function GET(request: NextRequest) {
  const backendUrl = process.env.API_BASE_URL;

  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value ?? null;

  const { searchParams } = request.nextUrl;
  const status = searchParams.get('status');
  const page = searchParams.get('page') ?? '1';
  const size = searchParams.get('size') ?? '20';

  if (!backendUrl) {
    return NextResponse.json({ totalCount: 0, feedbacks: [] });
  }

  try {
    const url = new URL('/api/v1/admin/feedbacks', backendUrl);
    if (status) url.searchParams.set('status', status);
    url.searchParams.set('page', page);
    url.searchParams.set('size', size);

    const beResponse = await fetch(url.toString(), {
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
