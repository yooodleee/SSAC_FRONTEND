import { cn } from '@/lib/utils';
import type { HomeContentItemDto } from '@/types';

// UI-only type
type DifficultyLevel = 'SEED' | 'SPROUT' | 'TREE';

const DIFFICULTY_BADGE: Record<DifficultyLevel, { bg: string; color: string }> = {
  SEED: { bg: '#E8F5EE', color: '#4CAF82' },
  SPROUT: { bg: '#FFF8E1', color: '#F9A825' },
  TREE: { bg: '#E3F2FD', color: '#1976D2' },
};

const FALLBACK_BADGE = { bg: '#F5F5F5', color: '#6B6B6B' };

function getDifficultyBadgeStyle(difficulty: string | undefined) {
  if (!difficulty) return FALLBACK_BADGE;
  const upper = difficulty.toUpperCase() as DifficultyLevel;
  return DIFFICULTY_BADGE[upper] ?? FALLBACK_BADGE;
}

interface RecommendedContentCardProps {
  item: HomeContentItemDto;
  onClick: () => void;
}

export function RecommendedContentCard({ item, onClick }: RecommendedContentCardProps) {
  const badgeStyle = getDifficultyBadgeStyle(item.difficulty);
  const isPreview = item.isPreview === true;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative w-full min-h-[48px] rounded-2xl p-4 text-left transition-opacity hover:opacity-90',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
        isPreview
          ? 'border-2 border-dashed border-[var(--color-info)]/50 bg-[#EEF4FB] focus-visible:ring-[var(--color-info)] dark:bg-slate-800/50'
          : 'border border-[var(--color-border)] bg-[var(--color-bg-card)] focus-visible:ring-[#4CAF82]',
      )}
    >
      {/* 완료 배지 (일반 콘텐츠) */}
      {!isPreview && item.completed && (
        <span className="absolute right-3 top-3 text-xs font-semibold text-[#4CAF82]">✅ 완료</span>
      )}

      {/* 상위 레벨 콘텐츠 배지 (미리보기 콘텐츠) */}
      {isPreview && (
        <span className="absolute right-3 top-3 rounded-full bg-[#E3F2FD] px-2 py-0.5 text-xs font-semibold text-[#1976D2]">
          상위 레벨 콘텐츠
        </span>
      )}

      <div className="mb-1 flex items-center gap-1">
        {item.categoryEmoji && <span aria-hidden="true">{item.categoryEmoji}</span>}
        {item.category && (
          <span className="text-xs text-[var(--color-text-secondary)]">{item.category}</span>
        )}
      </div>

      {item.difficultyLabel && (
        <span
          className="mb-2 inline-block rounded-full px-2 py-0.5 text-xs font-semibold"
          style={{ backgroundColor: badgeStyle.bg, color: badgeStyle.color }}
        >
          {item.difficultyLabel}
        </span>
      )}

      <p className="text-sm font-medium text-[var(--color-text-primary)] line-clamp-2">
        {item.title}
      </p>

      {/* 미리보기 유도 메시지 */}
      {isPreview && item.previewMessage && (
        <p className="mt-2 text-xs text-[var(--color-info)]">{item.previewMessage}</p>
      )}

      {/* 하단 행: 소요 시간(일반) / 미리 보기 CTA(미리보기) */}
      {isPreview ? (
        <p className="mt-2 text-right text-xs font-medium text-[var(--color-info)]">미리 보기 →</p>
      ) : null}
    </button>
  );
}
