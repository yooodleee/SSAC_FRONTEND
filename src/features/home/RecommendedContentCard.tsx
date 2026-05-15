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

  return (
    <button
      type="button"
      onClick={onClick}
      className="relative w-full min-h-[48px] rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 text-left transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4CAF82] focus-visible:ring-offset-1"
    >
      {item.isCompleted && (
        <span className="absolute right-3 top-3 text-xs font-semibold text-[#4CAF82]">✅ 완료</span>
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
      {item.estimatedMinutes > 0 && (
        <p className="mt-2 text-right text-xs text-[var(--color-text-secondary)]">
          {item.estimatedMinutes}분이면 충분
        </p>
      )}
    </button>
  );
}
