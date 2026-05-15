import type { HomeContentItemDto } from '@/types';
import { RecommendedContentCard } from './RecommendedContentCard';

interface RecommendedSectionProps {
  items: HomeContentItemDto[];
  onItemClick: (id: string) => void;
}

export function RecommendedSection({ items, onItemClick }: RecommendedSectionProps) {
  return (
    <section>
      <h2 className="mb-3 text-base font-bold text-[var(--color-text-primary)]">📚 추천 콘텐츠</h2>
      {items.length === 0 ? (
        <p className="text-sm text-[var(--color-text-secondary)]">추천 콘텐츠가 없어요.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <RecommendedContentCard
              key={item.id}
              item={item}
              onClick={() => {
                onItemClick(item.id);
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}
