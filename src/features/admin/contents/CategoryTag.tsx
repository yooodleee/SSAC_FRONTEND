'use client';

import { cn } from '@/lib/utils';

export const CATEGORIES = [
  { label: '부동산/자취', color: '#EF5350' },
  { label: '세금/연말정산', color: '#FF9800' },
  { label: '재테크/신용', color: '#4CAF50' },
  { label: '근로/급여', color: '#9E9E9E' },
  { label: '학자금/장학금', color: '#2196F3' },
  { label: '사회보험/복지', color: '#FFC107' },
  { label: '소비/예산관리', color: '#9C27B0' },
  { label: '시리즈', color: '#E91E93' },
] as const;

export type CategoryLabel = (typeof CATEGORIES)[number]['label'];

export function getCategoryColor(label: string): string {
  return CATEGORIES.find((c) => c.label === label)?.color ?? '#9E9E9E';
}

interface CategoryTagProps {
  label: string;
  onRemove?: () => void;
  small?: boolean;
}

export function CategoryTag({ label, onRemove, small }: CategoryTagProps) {
  const color = getCategoryColor(label);
  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 rounded-full font-medium text-white',
        small ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs',
      )}
      style={{ backgroundColor: color }}
    >
      {label}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 leading-none hover:opacity-75"
          aria-label={`${label} 제거`}
        >
          ×
        </button>
      )}
    </span>
  );
}

interface CategoryPickerProps {
  selected: string[];
  onChange: (next: string[]) => void;
}

export function CategoryPicker({ selected, onChange }: CategoryPickerProps) {
  const toggle = (label: string) => {
    if (selected.includes(label)) {
      onChange(selected.filter((c) => c !== label));
    } else {
      onChange([...selected, label]);
    }
  };

  return (
    <div className="flex flex-wrap gap-1.5 rounded-lg border border-[#E8E8E8] bg-white p-2 shadow-md">
      {CATEGORIES.map((cat) => {
        const isSelected = selected.includes(cat.label);
        return (
          <button
            key={cat.label}
            type="button"
            onClick={() => toggle(cat.label)}
            className={cn(
              'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium text-white transition-all',
              isSelected ? 'scale-105 opacity-100 shadow-sm' : 'opacity-40 hover:opacity-70',
            )}
            style={{ backgroundColor: cat.color }}
          >
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}
