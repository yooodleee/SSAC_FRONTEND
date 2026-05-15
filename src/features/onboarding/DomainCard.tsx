import { cn } from '@/lib/utils';

interface DomainCardProps {
  id: string;
  emoji: string;
  name: string;
  reason: string;
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
}

export function DomainCard({
  id,
  emoji,
  name,
  reason,
  selected,
  disabled,
  onClick,
}: DomainCardProps) {
  return (
    <button
      type="button"
      id={id}
      onClick={onClick}
      disabled={disabled && !selected}
      aria-pressed={selected}
      className={cn(
        'relative flex flex-col gap-1.5 rounded-2xl border-2 p-4 text-left transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4CAF82] focus-visible:ring-offset-2',
        selected
          ? 'border-[#4CAF82] bg-[#E8F5EE]'
          : 'border-[var(--color-border)] bg-[var(--color-bg-card)] hover:border-[#4CAF82]/50',
        disabled && !selected && 'cursor-not-allowed opacity-60',
      )}
    >
      {selected && (
        <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#4CAF82]">
          <svg
            className="h-3 w-3 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </span>
      )}
      <span className="text-2xl" aria-hidden="true">
        {emoji}
      </span>
      <span className="text-sm font-semibold text-[var(--color-text-primary)]">{name}</span>
      <span className="text-xs leading-relaxed text-[var(--color-text-secondary)]">{reason}</span>
    </button>
  );
}
