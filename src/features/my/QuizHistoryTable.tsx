import type { QuizHistoryItem } from '@/types';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface QuizHistoryTableProps {
  items: QuizHistoryItem[];
}

export default function QuizHistoryTable({ items }: QuizHistoryTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
            <th className="px-4 py-3">결과</th>
            <th className="px-4 py-3">퀴즈 제목</th>
            <th className="px-4 py-3">카테고리</th>
            <th className="px-4 py-3 text-right">점수</th>
            <th className="px-4 py-3 text-right">날짜</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {items.map((item) => (
            <tr key={item.id} className="transition-colors hover:bg-gray-50">
              <td className="px-4 py-3">
                <span
                  className={cn(
                    'inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold',
                    item.isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600',
                  )}
                >
                  {item.isCorrect ? '✓' : '✗'}
                </span>
              </td>
              <td className="max-w-[200px] truncate px-4 py-3 font-medium text-gray-900">
                {item.quizTitle}
              </td>
              <td className="px-4 py-3">
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                  {item.category}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <span
                  className={cn(
                    'font-semibold',
                    item.score >= 80
                      ? 'text-green-600'
                      : item.score >= 60
                        ? 'text-yellow-600'
                        : 'text-red-500',
                  )}
                >
                  {item.score}점
                </span>
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-right text-gray-400">
                {formatDate(item.answeredAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
