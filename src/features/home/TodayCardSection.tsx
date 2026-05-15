import type { TodayCardDto } from '@/types';

interface TodayCardSectionProps {
  todayCard: TodayCardDto | null;
  onCardClick: (id: string) => void;
}

export function TodayCardSection({ todayCard, onCardClick }: TodayCardSectionProps) {
  if (!todayCard) {
    return (
      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4">
        <p className="text-center text-sm text-[var(--color-text-secondary)] whitespace-pre-line">
          {'🎉 오늘의 추천 콘텐츠를 모두 완료했어요!\n다른 콘텐츠를 탐색해볼까요?'}
        </p>
      </section>
    );
  }

  return (
    <section>
      <button
        type="button"
        onClick={() => {
          onCardClick(todayCard.id);
        }}
        className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 text-left transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4CAF82] focus-visible:ring-offset-1"
      >
        <p className="mb-2 text-xs font-semibold text-[#4CAF82]">📌 오늘의 추천</p>
        <p className="mb-1 text-xs text-[var(--color-text-secondary)]">
          {todayCard.categoryEmoji} {todayCard.category}
        </p>
        <p className="text-base font-semibold text-[var(--color-text-primary)] line-clamp-2">
          {todayCard.title}
        </p>
        <p className="mt-3 text-right text-xs text-[var(--color-text-secondary)]">
          {todayCard.estimatedMinutes}분이면 충분
        </p>
      </button>
    </section>
  );
}
