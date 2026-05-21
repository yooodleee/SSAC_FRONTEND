/**
 * 검색 API
 *
 * GET /api/search?q=<query>
 *
 * JSONPlaceholder posts를 검색 데이터로 활용합니다.
 * 제목 일치 → 본문 일치 순으로 관련도 점수를 부여합니다.
 */

import { logSearchKeyword, getPopularKeywords } from '@/lib/search-store';
import type { SearchResponse } from '@/types';

interface RawPost {
  id: number;
  userId: number;
  title: string;
  body: string;
}

const CATEGORY_MAP: Record<number, string> = {
  1: '주식',
  2: '채권',
  3: '펀드',
  4: '보험',
  5: '세금',
  6: '부동산',
  7: '암호화폐',
  8: '퇴직연금',
  9: '대출',
  10: '환율',
};

function getCategory(userId: number): string {
  return CATEGORY_MAP[userId] ?? '금융일반';
}

function calcScore(title: string, body: string, q: string): number {
  const lq = q.toLowerCase();
  const lt = title.toLowerCase();
  const lb = body.toLowerCase();
  let score = 0;
  if (lt.includes(lq)) score += 10;
  if (lb.includes(lq)) score += 5;
  // 단어 단위 완전 일치 보너스
  if (lt.split(/\s+/).some((w) => w === lq)) score += 3;
  return score;
}

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim() ?? '';

  if (!q || q.length > 50) {
    return Response.json({ error: '검색어는 1자 이상 50자 이하여야 합니다.' }, { status: 400 });
  }

  // 검색어 익명 로그 수집
  logSearchKeyword(q);

  const res = await fetch('https://jsonplaceholder.typicode.com/posts', { cache: 'force-cache' });
  const posts: RawPost[] = await res.json();

  const scored = posts
    .map((p) => ({
      id: String(p.id),
      title: p.title,
      summary: p.body.slice(0, 100).replace(/\n/g, ' '),
      category: getCategory(p.userId),
      relevanceScore: calcScore(p.title, p.body, q),
    }))
    .filter((p) => p.relevanceScore > 0)
    .sort((a, b) => b.relevanceScore - a.relevanceScore);

  const body: SearchResponse = {
    results: scored,
    total: scored.length,
    query: q,
    popularKeywords: getPopularKeywords(5),
  };

  return Response.json(body);
}
