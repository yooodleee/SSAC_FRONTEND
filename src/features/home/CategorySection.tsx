import type { CategorySummaryDto } from '@/types';
import { ProgressBar } from './ProgressBar';

interface CategorySectionProps {
  categories: CategorySummaryDto[];
  onCategoryClick: (id: string) => void;
}

export function CategorySection({ categories, onCategoryClick }: CategorySectionProps) {
  return (
    <section>
      <h2 className="mb-3 text-base font-bold text-[var(--color-text-primary)]">
        🗂️ 카테고리 탐색
      </h2>
      <div className="grid grid-cols-3 gap-3">
        {categories.map((cat) => {
          const progressPercent =
            cat.totalCount > 0 ? Math.round((cat.completedCount / cat.totalCount) * 100) : 0;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                onCategoryClick(cat.id);
              }}
              className="flex min-h-[80px] flex-col items-center justify-center gap-1 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-3 transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4CAF82] focus-visible:ring-offset-1"
            >
              <span className="text-2xl" aria-hidden="true">
                {cat.emoji}
              </span>
              <span className="text-xs font-medium text-[var(--color-text-primary)] line-clamp-1">
                {cat.name}
              </span>
              <span className="text-xs text-[var(--color-text-secondary)]">
                {cat.completedCount}/{cat.totalCount}
              </span>
              <ProgressBar percent={progressPercent} className="mt-1" />
            </button>
          );
        })}
      </div>
    </section>
  );
}
