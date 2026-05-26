'use client';

/**
 * ContentGallery — 두 번째 섹션: 비대칭 그리드 콘텐츠 갤러리
 *
 * 레이아웃:
 *   데스크탑: 좌측 대형 카드(2행 차지) + 우측 2×2 소형 카드
 *   태블릿: 2열 그리드
 *   모바일: 1열 목록
 *
 * - [신규 콘텐츠][인기 콘텐츠] 탭 전환
 * - GET /api/v1/contents 연동 (실패 시 정적 플레이스홀더)
 * - Intersection Observer 기반 순차 fade-in + slide-up
 * - prefers-reduced-motion 대응
 */

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import type { components } from '@/api-contract/generated/api-types';
import { ContentGalleryCard, ContentGalleryCardSkeleton } from './ContentGalleryCard';

type ContentItemDto = components['schemas']['ContentItemDto'];

// 정적 플레이스홀더 — API 실패 시 사용
const PLACEHOLDER_CONTENTS: ContentItemDto[] = [
  { id: 'p1', title: '전세 계약 시 꼭 확인해야 할 5가지', difficulty: 'SEED' },
  { id: 'p2', title: '연말정산 환급금 극대화하는 방법', difficulty: 'SPROUT' },
  { id: 'p3', title: '주식 투자 전 꼭 알아야 할 기본 용어', difficulty: 'SPROUT' },
  { id: 'p4', title: '실업급여 신청 방법 완전 정복', difficulty: 'SEED' },
  { id: 'p5', title: '청년도약계좌 가입 자격과 혜택 총정리', difficulty: 'TREE' },
];

async function fetchContents(): Promise<ContentItemDto[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
    const res = await fetch(`${apiUrl}/api/v1/contents`, {
      credentials: 'include',
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { data?: { contents?: ContentItemDto[] } };
    return data?.data?.contents ?? [];
  } catch {
    return [];
  }
}

export function ContentGallery() {
  const [items, setItems] = useState<ContentItemDto[] | null>(null); // null = 로딩 중
  const [retryCount, setRetryCount] = useState(0);
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  // 데이터 fetch
  useEffect(() => {
    let cancelled = false;
    fetchContents().then((data) => {
      if (!cancelled) {
        setItems(data.length > 0 ? data : PLACEHOLDER_CONTENTS);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [retryCount]);

  // Intersection Observer — 섹션 진입 시 fade-in
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const isLoading = items === null;
  const displayItems = isLoading ? Array(5).fill(null) : items.slice(0, 5);
  const [largeItem, ...smallItems] = displayItems;

  return (
    <section
      ref={sectionRef}
      aria-label="콘텐츠 갤러리"
      className={cn(
        'bg-white px-4 py-16 sm:px-6 motion-reduce:transition-none motion-reduce:translate-y-0 motion-reduce:opacity-100',
        'transition-all duration-700',
        visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0',
      )}
    >
      <div className="mx-auto max-w-6xl">
        {/* 섹션 헤더 */}
        <div className="mb-8">
          <h2 className="font-bold text-[#1A1A1A]" style={{ fontSize: '22px', lineHeight: '1.3' }}>
            한 눈에 보는 금융 소식!
          </h2>
        </div>

        {/* 비대칭 그리드 레이아웃 */}
        {/* 모바일: 1열, 태블릿: 2열, 데스크탑: 3열 비대칭 */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* 대형 카드 — 데스크탑에서 1열 2행 차지 */}
          <div className="sm:row-span-2 lg:col-span-1">
            {isLoading ? (
              <ContentGalleryCardSkeleton large />
            ) : largeItem ? (
              <div
                className={cn(
                  'h-full transition-all duration-500 motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0',
                  visible ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0',
                )}
              >
                <ContentGalleryCard item={largeItem as ContentItemDto} large />
              </div>
            ) : null}
          </div>

          {/* 소형 카드 4개 — 우측 2×2 */}
          {smallItems.slice(0, 4).map((item, i) =>
            isLoading ? (
              <ContentGalleryCardSkeleton key={i} />
            ) : item ? (
              <div
                key={(item as ContentItemDto).id ?? i}
                className="motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0"
                style={{
                  transition: 'opacity 500ms ease, transform 500ms ease',
                  transitionDelay: `${(i + 1) * 100}ms`,
                  opacity: visible ? 1 : 0,
                  transform: visible ? 'translateY(0)' : 'translateY(20px)',
                }}
              >
                <ContentGalleryCard item={item as ContentItemDto} />
              </div>
            ) : null,
          )}
        </div>

        {/* API 실패 시 재시도 버튼 (플레이스홀더 표시 중일 때) */}
        {!isLoading && items === PLACEHOLDER_CONTENTS && (
          <div className="mt-6 flex items-center justify-center gap-3 text-sm text-[#6B6B6B]">
            <span>일부 콘텐츠를 불러오지 못했습니다.</span>
            <button
              type="button"
              onClick={() => setRetryCount((c) => c + 1)}
              className="rounded-md bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              다시 시도
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
