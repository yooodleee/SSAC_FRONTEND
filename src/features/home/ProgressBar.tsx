interface ProgressBarProps {
  percent: number; // 0-100
  className?: string;
}

export function ProgressBar({ percent, className = '' }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, percent));
  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`진행률 ${clamped}%`}
      className={`h-2 w-full overflow-hidden rounded-full bg-[var(--color-bg-card)] ${className}`}
    >
      <div
        className="h-full rounded-full bg-[#4CAF82] transition-[width] duration-500"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
