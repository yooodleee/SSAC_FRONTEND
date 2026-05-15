import type { ContinueLearningDto } from '@/types';
import { ProgressBar } from './ProgressBar';

interface ContinueLearningSectionProps {
  continueLearning: ContinueLearningDto | null;
  onContinueClick: (id: string) => void;
}

export function ContinueLearningSection({
  continueLearning,
  onContinueClick,
}: ContinueLearningSectionProps) {
  if (!continueLearning) return null;

  return (
    <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4">
      <p className="mb-2 text-xs font-semibold text-[var(--color-text-secondary)]">
        📖 이어서 학습하기
      </p>
      <p className="mb-3 text-sm font-medium text-[var(--color-text-primary)] line-clamp-2">
        {continueLearning.title}
      </p>
      <ProgressBar percent={continueLearning.progressPercent} className="mb-2" />
      <div className="flex items-center justify-between">
        <span className="text-xs text-[var(--color-text-secondary)]">
          {continueLearning.progressPercent}% 완료
        </span>
        <button
          type="button"
          onClick={() => {
            onContinueClick(continueLearning.id);
          }}
          className="min-h-[48px] rounded-xl px-4 text-sm font-semibold text-[#4CAF82] transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4CAF82] focus-visible:ring-offset-1"
        >
          이어 보기 →
        </button>
      </div>
    </section>
  );
}
