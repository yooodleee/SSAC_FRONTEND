export function OnboardingResultSkeleton() {
  return (
    <div
      className="flex flex-col items-center gap-6 py-8"
      aria-busy="true"
      aria-label="결과 로딩 중"
    >
      {/* 마스코트 skeleton */}
      <div className="h-20 w-20 animate-pulse rounded-full bg-[var(--color-bg-card)]" />

      {/* 레벨 제목 skeleton */}
      <div className="flex flex-col items-center gap-2">
        <div className="h-7 w-52 animate-pulse rounded-lg bg-[var(--color-bg-card)]" />
        <div className="h-5 w-40 animate-pulse rounded-lg bg-[var(--color-bg-card)]" />
      </div>

      {/* 설명 skeleton */}
      <div className="flex flex-col items-center gap-1.5">
        <div className="h-4 w-64 animate-pulse rounded bg-[var(--color-bg-card)]" />
        <div className="h-4 w-56 animate-pulse rounded bg-[var(--color-bg-card)]" />
      </div>

      <hr className="w-full border-[var(--color-border)]" />

      {/* 도메인 섹션 제목 skeleton */}
      <div className="h-5 w-44 animate-pulse self-start rounded bg-[var(--color-bg-card)]" />

      {/* 도메인 카드 skeleton */}
      <div className="grid w-full grid-cols-3 gap-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-[var(--color-bg-card)]" />
        ))}
      </div>

      {/* 버튼 skeleton */}
      <div className="h-12 w-full animate-pulse rounded-xl bg-[var(--color-bg-card)]" />
    </div>
  );
}
