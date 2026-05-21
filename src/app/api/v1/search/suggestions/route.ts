import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * GET /api/v1/search/suggestions?q=<query>
 * BE /api/v1/search/suggestions 프록시
 * q가 비어 있으면 인기 검색어 10개 반환 (BE 동작)
 */
export async function GET(request: NextRequest) {
  const backendUrl = process.env.API_BASE_URL;
  if (!backendUrl) return NextResponse.json({ errorCode: 'SERVER_ERROR' }, { status: 500 });

  const q = request.nextUrl.searchParams.get('q') ?? '';

  try {
    const url = new URL('/api/v1/search/suggestions', backendUrl);
    if (q) url.searchParams.set('q', q);
    const beRes = await fetch(url.toString(), { cache: 'no-store' });
    const data = (await beRes.json()) as unknown;
    return NextResponse.json(data, { status: beRes.status });
  } catch {
    return NextResponse.json({ errorCode: 'SERVER_ERROR' }, { status: 500 });
  }
}
