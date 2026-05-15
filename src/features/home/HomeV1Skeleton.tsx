export function GreetingSkeleton() {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex flex-col gap-2">
        <div className="animate-pulse rounded-lg bg-[var(--color-bg-card)] h-7 w-48" />
        <div className="animate-pulse rounded-lg bg-[var(--color-bg-card)] h-5 w-36" />
      </div>
      <div className="animate-pulse rounded-full bg-[var(--color-bg-card)] h-8 w-16" />
    </div>
  );
}

export function TodayCardSkeleton() {
  return <div className="animate-pulse rounded-2xl bg-[var(--color-bg-card)] h-36 w-full" />;
}

export function ContinueLearningSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl bg-[var(--color-bg-card)] p-4 flex flex-col gap-3">
      <div className="h-5 w-32 rounded-lg bg-[var(--color-border)]" />
      <div className="h-5 w-full rounded-lg bg-[var(--color-border)]" />
      <div className="h-2 w-full rounded-full bg-[var(--color-border)]" />
      <div className="h-4 w-24 rounded-lg bg-[var(--color-border)]" />
    </div>
  );
}

export function TodayQuizSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl bg-[var(--color-bg-card)] p-4 flex flex-col gap-3">
      <div className="h-5 w-28 rounded-lg bg-[var(--color-border)]" />
      <div className="h-6 w-full rounded-lg bg-[var(--color-border)]" />
      <div className="h-12 w-full rounded-xl bg-[var(--color-border)]" />
    </div>
  );
}

export function RecommendedSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <div className="animate-pulse rounded-lg bg-[var(--color-bg-card)] h-6 w-32" />
      {[0, 1, 2].map((i) => (
        <div key={i} className="animate-pulse rounded-2xl bg-[var(--color-bg-card)] h-28 w-full" />
      ))}
    </div>
  );
}

export function CategorySkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <div className="animate-pulse rounded-lg bg-[var(--color-bg-card)] h-6 w-36" />
      <div className="grid grid-cols-3 gap-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="animate-pulse rounded-2xl bg-[var(--color-bg-card)] h-20 w-full"
          />
        ))}
      </div>
    </div>
  );
}
