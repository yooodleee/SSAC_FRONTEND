import { cn } from '@/lib/utils';

interface ProgressIndicatorProps {
  current: number; // 1-based
  total: number;
}

export function ProgressIndicator({ current, total }: ProgressIndicatorProps) {
  return (
    <div
      className="flex gap-1.5"
      role="progressbar"
      aria-valuenow={current}
      aria-valuemin={1}
      aria-valuemax={total}
      aria-label={`${total}문제 중 ${current}번째`}
    >
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={cn(
            'h-2.5 w-2.5 rounded-full transition-colors duration-300',
            i < current ? 'bg-[#4CAF82]' : 'bg-[var(--color-border)]',
          )}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}
