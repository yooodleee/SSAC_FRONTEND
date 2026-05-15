import type { MyPageResponse } from '@/services/mypageV1';

interface StatCardProps {
  emoji: string;
  label: string;
  value: string;
}

function StatCard({ emoji, label, value }: StatCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-[var(--color-bg-page)] p-3 dark:bg-slate-800">
      <span className="text-xl" aria-hidden="true">
        {emoji}
      </span>
      <div className="flex flex-col">
        <span className="text-xs text-[var(--color-text-secondary)]">{label}</span>
        <span className="font-semibold text-[var(--color-text-primary)]">{value}</span>
      </div>
    </div>
  );
}

interface StatsSectionProps {
  data: MyPageResponse;
}

export function StatsSection({ data }: StatsSectionProps) {
  const stats = data.stats;

  return (
    <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6">
      <h2 className="mb-4 text-base font-semibold text-[var(--color-text-primary)]">
        나의 학습 현황
      </h2>
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          emoji="📚"
          label="완료한 콘텐츠"
          value={`${stats?.totalContentsCompleted ?? 0}개`}
        />
        <StatCard emoji="🎯" label="푼 퀴즈" value={`${stats?.totalQuizCompleted ?? 0}개`} />
        <StatCard emoji="✅" label="퀴즈 정답률" value={`${stats?.correctRate ?? 0}%`} />
        <StatCard emoji="🔥" label="연속 학습" value={`${stats?.continuousLearningDays ?? 0}일`} />
      </div>
    </section>
  );
}
