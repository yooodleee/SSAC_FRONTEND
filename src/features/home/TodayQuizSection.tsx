import type { TodayQuizDto } from '@/types';
import { Button } from '@/components/ui/Button';

interface TodayQuizSectionProps {
  todayQuiz: TodayQuizDto | null;
  onQuizClick: (id: string) => void;
}

export function TodayQuizSection({ todayQuiz, onQuizClick }: TodayQuizSectionProps) {
  if (!todayQuiz) {
    return (
      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4">
        <p className="text-center text-sm text-[var(--color-text-secondary)]">
          🎉 오늘의 퀴즈를 모두 완료했어요!
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4">
      <p className="mb-3 text-xs font-semibold text-[var(--color-text-secondary)]">
        🎯 오늘의 퀴즈
      </p>
      <p className="mb-4 text-sm font-medium text-[var(--color-text-primary)]">
        &ldquo;{todayQuiz.question}&rdquo;
      </p>
      <Button
        size="lg"
        onClick={() => {
          onQuizClick(todayQuiz.id);
        }}
        className="w-full rounded-xl bg-[#4CAF82] text-white hover:bg-[#388E60] focus-visible:ring-[#4CAF82]"
      >
        퀴즈 풀기 →
      </Button>
    </section>
  );
}
