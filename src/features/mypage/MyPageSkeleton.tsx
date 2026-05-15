export function MyPageSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-label="마이페이지 로딩 중">
      {/* 프로필 스켈레톤 */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-2">
            <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200 dark:bg-slate-700" />
            <div className="h-5 w-28 animate-pulse rounded bg-gray-200 dark:bg-slate-700" />
            <div className="h-4 w-36 animate-pulse rounded bg-gray-200 dark:bg-slate-700" />
          </div>
          <div className="h-8 w-20 animate-pulse rounded-lg bg-gray-200 dark:bg-slate-700" />
        </div>
      </div>

      {/* 레벨 스켈레톤 */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6">
        <div className="mb-4 h-5 w-20 animate-pulse rounded bg-gray-200 dark:bg-slate-700" />
        <div className="mb-2 h-8 w-24 animate-pulse rounded bg-gray-200 dark:bg-slate-700" />
        <div className="mb-4 h-4 w-40 animate-pulse rounded bg-gray-200 dark:bg-slate-700" />
        <div className="flex flex-col gap-3">
          {[1, 2].map((i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <div className="h-3.5 w-24 animate-pulse rounded bg-gray-200 dark:bg-slate-700" />
              <div className="h-2.5 w-full animate-pulse rounded-full bg-gray-200 dark:bg-slate-700" />
            </div>
          ))}
        </div>
      </div>

      {/* 학습 통계 스켈레톤 */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6">
        <div className="mb-4 h-5 w-28 animate-pulse rounded bg-gray-200 dark:bg-slate-700" />
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded-xl bg-gray-200 dark:bg-slate-700" />
          ))}
        </div>
      </div>

      {/* 관심 도메인 스켈레톤 */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6">
        <div className="mb-4 h-5 w-24 animate-pulse rounded bg-gray-200 dark:bg-slate-700" />
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-gray-200 dark:bg-slate-700" />
          ))}
        </div>
      </div>
    </div>
  );
}
