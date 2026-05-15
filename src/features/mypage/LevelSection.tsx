import { cn } from '@/lib/utils';
import type { MyPageResponse } from '@/services/mypageV1';

// 레벨업 기준값 (FE 상수 — BE에서 동적으로 제공되면 API 응답으로 교체할 것)
const LEVEL_UP_THRESHOLD = 70;

type Level = 'SEED' | 'SPROUT' | 'TREE';

interface ProgressBarProps {
  label: string;
  current: number;
  required: number;
}

function ProgressBar({ label, current, required }: ProgressBarProps) {
  const pct = Math.min(Math.round((current / required) * 100), 100);
  const met = current >= required;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-[var(--color-text-secondary)]">{label}</span>
        <span
          className={cn(
            'font-medium tabular-nums',
            met ? 'text-[#4CAF82]' : 'text-[var(--color-text-primary)]',
          )}
        >
          {current}% / {required}%
        </span>
      </div>
      <div
        className="h-2.5 overflow-hidden rounded-full bg-gray-200 dark:bg-slate-700"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label} ${pct}%`}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            met ? 'bg-[#4CAF82]' : 'bg-[#4CAF82]/70',
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

interface LevelSectionProps {
  data: MyPageResponse;
  onRetake: () => void;
}

export function LevelSection({ data, onRetake }: LevelSectionProps) {
  const level = (data.level as Level) ?? 'SEED';
  const isMaxLevel = level === 'TREE';
  const correctRate = data.stats?.correctRate ?? 0;

  return (
    <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6">
      <h2 className="mb-4 text-base font-semibold text-[var(--color-text-primary)]">나의 레벨</h2>

      <div className="mb-4 flex flex-col gap-0.5">
        <p className="text-xl font-bold text-[var(--color-text-primary)]">
          {data.levelEmoji} {data.levelLabel}
        </p>
        <p className="text-sm text-[var(--color-text-secondary)]">
          {level === 'SEED'
            ? '금융이 처음이어도 괜찮아요'
            : level === 'SPROUT'
              ? '조금은 알고 있어요'
              : '어느 정도 알고 있어요'}
        </p>
      </div>

      {isMaxLevel ? (
        <div className="mb-4 rounded-xl bg-[#E8F5EE] p-4 text-center dark:bg-[#4CAF82]/10">
          <p className="font-semibold text-[#4CAF82]">🌳 최고 레벨 달성!</p>
          <p className="mt-0.5 text-sm text-[var(--color-text-secondary)]">
            금융 전문가가 다 됐어요 🎉
          </p>
        </div>
      ) : (
        <div className="mb-4 flex flex-col gap-3">
          <p className="text-xs font-medium text-[var(--color-text-secondary)]">레벨업까지</p>
          <ProgressBar label="퀴즈 정답률" current={correctRate} required={LEVEL_UP_THRESHOLD} />
        </div>
      )}

      <button
        type="button"
        onClick={onRetake}
        className={cn(
          'w-full rounded-xl border border-[var(--color-border)] py-3 text-sm font-medium',
          'text-[var(--color-text-secondary)] transition-colors hover:border-[#4CAF82] hover:text-[#4CAF82]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4CAF82] focus-visible:ring-offset-1',
        )}
      >
        레벨 테스트 다시 하기
      </button>
    </section>
  );
}
