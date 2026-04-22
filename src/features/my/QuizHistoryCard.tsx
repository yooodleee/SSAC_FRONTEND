import type { QuizHistoryItem } from '@/types';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface QuizHistoryCardProps {
  item: QuizHistoryItem;
}

export default function QuizHistoryCard({ item }: QuizHistoryCardProps) {
  return (
    <div className="flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div
        className={cn(
          'mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold',
          item.isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600',
        )}
        aria-label={item.isCorrect ? '정답' : '오답'}
      >
        {item.isCorrect ? '✓' : '✗'}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-gray-900">{item.quizTitle}</p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
            {item.category}
          </span>
          <span className="text-xs text-gray-400">{formatDate(item.answeredAt)}</span>
        </div>
      </div>

      <div className="shrink-0 text-right">
        <span
          className={cn(
            'text-lg font-bold',
            item.score >= 80
              ? 'text-green-600'
              : item.score >= 60
                ? 'text-yellow-600'
                : 'text-red-500',
          )}
        >
          {item.score}점
        </span>
      </div>
    </div>
  );
}
