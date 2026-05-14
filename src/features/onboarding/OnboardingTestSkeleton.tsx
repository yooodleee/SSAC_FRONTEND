export function OnboardingTestSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-6" aria-busy="true" aria-label="문제 로딩 중">
      {/* Progress row */}
      <div className="flex items-center justify-between">
        <div className="h-4 w-10 rounded bg-[var(--color-bg-card)]" />
        <div className="flex gap-1.5">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="h-2.5 w-2.5 rounded-full bg-[var(--color-bg-card)]" />
          ))}
        </div>
      </div>

      {/* Title block */}
      <div className="flex flex-col gap-2">
        <div className="h-6 w-48 rounded bg-[var(--color-bg-card)]" />
        <div className="h-4 w-36 rounded bg-[var(--color-bg-card)]" />
      </div>

      {/* Question text */}
      <div className="h-5 w-full rounded bg-[var(--color-bg-card)]" />

      {/* Option cards */}
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="h-14 w-full rounded-xl bg-[var(--color-bg-card)]" />
      ))}

      {/* Action buttons */}
      <div className="flex gap-3">
        <div className="h-12 w-20 rounded-xl bg-[var(--color-bg-card)]" />
        <div className="h-12 flex-1 rounded-xl bg-[var(--color-bg-card)]" />
      </div>
    </div>
  );
}
