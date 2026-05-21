import type { Metadata } from 'next';
import Link from 'next/link';
import type { SearchItem, SearchResultResponse } from '@/types';

export const dynamic = 'force-dynamic';

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams;
  return { title: q ? `"${q}" 검색 결과` : '검색' };
}

// ── 난이도 배지 ──────────────────────────────────────────────
const DIFFICULTY_STYLE: Record<string, { bg: string; text: string }> = {
  SEED: { bg: '#E8F5EE', text: '#4CAF82' },
  SPROUT: { bg: '#FFF8E1', text: '#F9A825' },
  TREE: { bg: '#E3F2FD', text: '#1976D2' },
};

function DifficultyBadge({ difficulty, label }: { difficulty?: string; label?: string }) {
  if (!difficulty || !label) return null;
  const style = DIFFICULTY_STYLE[difficulty] ?? { bg: '#F5F5F5', text: '#6B6B6B' };
  return (
    <span
      className="rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      {label}
    </span>
  );
}

// ── 검색어 하이라이트 ──────────────────────────────────────────
function HighlightedTitle({ title, query }: { title: string; query: string }) {
  if (!query || !title) return <>{title}</>;
  const idx = title.toLowerCase().indexOf(query.toLowerCase());
  if (idx < 0) return <>{title}</>;
  return (
    <>
      {title.slice(0, idx)}
      <strong className="font-bold">{title.slice(idx, idx + query.length)}</strong>
      {title.slice(idx + query.length)}
    </>
  );
}

// ── 검색 결과 카드 ──────────────────────────────────────────
function SearchCard({ item, query }: { item: SearchItem; query: string }) {
  return (
    <li>
      <Link
        href={`/content/${item.id}`}
        className="block rounded-2xl border border-[#E8E8E8] bg-white p-5 shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4CAF82]"
      >
        {/* 카드 상단: 카테고리 + 난이도 배지 */}
        <div className="mb-3 flex items-center gap-2 flex-wrap">
          {item.categoryEmoji && (
            <span aria-hidden="true" className="text-base">
              {item.categoryEmoji}
            </span>
          )}
          {item.category && (
            <span className="text-xs font-medium text-gray-500">{item.category}</span>
          )}
          <DifficultyBadge difficulty={item.difficulty} label={item.difficultyLabel} />
        </div>

        {/* 제목 (검색어 강조) */}
        <p className="mb-1 font-semibold text-[#1A1A1A]">
          <HighlightedTitle title={item.title ?? ''} query={query} />
        </p>

        {/* 예상 시간 */}
        {item.estimatedMinutes && (
          <p className="mt-2 text-right text-xs text-gray-400">
            {item.estimatedMinutes}분이면 충분해요
          </p>
        )}
      </Link>
    </li>
  );
}

// ── 빈 상태 ──────────────────────────────────────────
function EmptyState({ query }: { query: string }) {
  return (
    <div className="py-16 text-center">
      <p className="text-[15px] text-gray-500">
        &ldquo;{query}&rdquo;에 대한 결과가 없습니다. 다른 검색어를 사용하여 다시 시도해주세요.
      </p>
    </div>
  );
}

// ── 데이터 페칭 ──────────────────────────────────────────
async function fetchSearchResults(q: string): Promise<SearchResultResponse | null> {
  const backendUrl = process.env.API_BASE_URL;
  if (!backendUrl) return null;

  try {
    const url = new URL('/api/v1/search', backendUrl);
    url.searchParams.set('q', q);
    const res = await fetch(url.toString(), { cache: 'no-store' });
    if (!res.ok) return null;
    const body = (await res.json()) as { data?: SearchResultResponse };
    return body.data ?? null;
  } catch {
    return null;
  }
}

// ── 페이지 ──────────────────────────────────────────
export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = q?.trim() ?? '';

  let data: SearchResultResponse | null = null;
  if (query) {
    data = await fetchSearchResults(query);
  }

  const results = data?.results ?? [];
  const totalCount = data?.totalCount ?? 0;

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-4 pt-24 pb-12 sm:px-6">
        {!query ? (
          <p className="text-center text-[15px] text-gray-500">
            검색어를 입력하여 금융 콘텐츠를 탐색하세요.
          </p>
        ) : (
          <>
            {/* 검색 헤더 */}
            <div className="mb-8">
              <h1 className="text-xl font-bold text-[#1A1A1A]">&ldquo;{query}&rdquo; 검색 결과</h1>
              {data && (
                <p className="mt-1 text-sm text-gray-400">
                  총 {totalCount.toLocaleString()}개의 콘텐츠
                </p>
              )}
            </div>

            {/* 결과 목록 */}
            {results.length === 0 ? (
              <EmptyState query={query} />
            ) : (
              <ul className="space-y-4">
                {results.map((item) => (
                  <SearchCard key={item.id} item={item} query={query} />
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  );
}
