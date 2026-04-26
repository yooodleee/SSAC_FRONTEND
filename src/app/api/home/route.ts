/**
 * BFF (Backend For Frontend) — Home Aggregation Endpoint
 *
 * GET /api/home
 *
 * 4개의 upstream API를 Promise.all()로 병렬 호출하여 하나의 응답으로 집계합니다.
 * CSR 클라이언트가 단일 요청으로 홈 화면 전체 데이터를 수신할 수 있습니다.
 *
 * 참고: ARCH-001 예외 — Route Handler는 BFF 레이어로 services/ 직접 사용 허용.
 */

import { homeService } from '@/services/home';
import type { HomeData } from '@/types';

export async function GET(): Promise<Response> {
  const [carousel, quiz, content] = await Promise.all([
    homeService.getCarousel(),
    homeService.getQuiz(),
    homeService.getContent(),
  ]);

  const body: HomeData = { carousel, quiz, content };

  return Response.json(body, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    },
  });
}
