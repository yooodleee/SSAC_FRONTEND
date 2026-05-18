/**
 * ContentGalleryCard — 콘텐츠 갤러리 카드
 * - 썸네일 이미지, 카테고리 태그, 난이도 태그, 제목, 예상 소요 시간
 * - hover: scale(1.02) / transition 300ms ease
 */

import type { components } from '@/api-contract/generated/api-types';

type ContentItemDto = components['schemas']['ContentItemDto'];

// 난이도별 스타일 — DESIGN.md 토큰 기준
const DIFFICULTY_CONFIG: Record<
  string,
  { emoji: string; bg: string; text: string; label: string }
> = {
  SEED: { emoji: '🌱', bg: '#E8F5EE', text: '#4CAF82', label: '씨앗' },
  SPROUT: { emoji: '🌿', bg: '#FFF8E1', text: '#F9A825', label: '새싹' },
  TREE: { emoji: '🌳', bg: '#E3F2FD', text: '#1976D2', label: '나무' },
};

function DifficultyBadge({ difficulty }: { difficulty?: string }) {
  const conf = (difficulty && DIFFICULTY_CONFIG[difficulty]) ||
    DIFFICULTY_CONFIG['SEED'] || { emoji: '🌱', bg: '#E8F5EE', text: '#4CAF82', label: '씨앗' };
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
      style={{ backgroundColor: conf.bg, color: conf.text }}
    >
      {conf.emoji} {conf.label}
    </span>
  );
}

interface ContentGalleryCardProps {
  item: ContentItemDto;
  large?: boolean;
}

export function ContentGalleryCard({ item, large = false }: ContentGalleryCardProps) {
  return (
    <a
      href={`/content/${item.id ?? ''}`}
      className="group flex flex-col overflow-hidden bg-[#F5F5F5] transition-transform duration-300 ease-in-out hover:scale-[1.02] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      style={{ height: large ? '100%' : undefined }}
    >
      {/* 썸네일 — large 카드는 flex-1로 남은 공간 모두 차지 */}
      <div
        className={`relative w-full overflow-hidden ${large ? 'flex-1' : 'h-32 sm:h-36'}`}
        style={{ background: 'linear-gradient(135deg, #e8f5ee 0%, #e3f2fd 100%)' }}
      >
        <div
          className="absolute inset-0 flex items-center justify-center text-5xl"
          aria-hidden="true"
        >
          📚
        </div>
      </div>

      {/* 카드 정보 — large/small 동일한 높이 */}
      <div className="flex flex-col gap-1.5 p-3">
        {/* 상단 메타 — 카테고리 + 난이도 */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
            style={{ backgroundColor: '#E3F2FD', color: '#1976D2' }}
          >
            금융
          </span>
          <DifficultyBadge difficulty={item.difficulty} />
        </div>

        {/* 제목 */}
        <p
          className="line-clamp-2 font-semibold leading-snug text-[#1A1A1A]"
          style={{ fontSize: '14px' }}
        >
          {item.title ?? '콘텐츠 제목'}
        </p>

        {/* 예상 소요 시간 */}
        {item.estimatedMinutes != null && (
          <p className="text-xs" style={{ color: '#6B6B6B' }}>
            {item.estimatedMinutes}분이면 충분합니다
          </p>
        )}
      </div>
    </a>
  );
}

// ── 스켈레톤 ────────────────────────────────────────────────────────────────

export function ContentGalleryCardSkeleton({ large = false }: { large?: boolean }) {
  return (
    <div
      className="flex flex-col overflow-hidden bg-[#F5F5F5]"
      style={{ height: large ? '100%' : undefined }}
    >
      <div
        className={`animate-pulse bg-gray-200 ${large ? 'flex-1 min-h-[128px]' : 'h-32 sm:h-36'}`}
      />
      <div className="flex flex-col gap-1.5 p-3">
        <div className="flex gap-1.5">
          <div className="h-5 w-10 animate-pulse rounded-full bg-gray-200" />
          <div className="h-5 w-10 animate-pulse rounded-full bg-gray-200" />
        </div>
        <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200" />
      </div>
    </div>
  );
}
