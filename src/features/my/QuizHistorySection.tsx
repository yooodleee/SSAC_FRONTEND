'use client';

import { useState } from 'react';
import { useInfiniteQuizHistory } from '@/hooks/useInfiniteScroll';
import { cn } from '@/lib/utils';
import QuizHistoryCard from './QuizHistoryCard';
import QuizHistoryTable from './QuizHistoryTable';
import EmptyState from './EmptyState';

type ViewType = 'card' | 'table';

export default function QuizHistorySection() {
  const [viewType, setViewType] = useState<ViewType>('card');
  const { items, isLoading, isFetchingMore, hasMore, total, error, sentinelRef } =
    useInfiniteQuizHistory(10);

  return (
    <section className="mt-8">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">
          퀴즈 기록
          {total > 0 && <span className="ml-2 text-sm font-normal text-gray-400">{total}개</span>}
        </h3>

        <div className="flex rounded-lg border border-gray-200 bg-white p-0.5 shadow-sm">
          <button
            type="button"
            onClick={() => setViewType('card')}
            className={cn(
              'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              viewType === 'card'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700',
            )}
            aria-pressed={viewType === 'card'}
          >
            카드
          </button>
          <button
            type="button"
            onClick={() => setViewType('table')}
            className={cn(
              'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              viewType === 'table'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700',
            )}
            aria-pressed={viewType === 'table'}
          >
            표
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {isLoading && !error && (
        <div className="space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-200" />
          ))}
        </div>
      )}

      {!isLoading && !error && items.length === 0 && <EmptyState />}

      {!isLoading && !error && items.length > 0 && (
        <>
          {viewType === 'card' ? (
            <div className="space-y-3">
              {items.map((item) => (
                <QuizHistoryCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <QuizHistoryTable items={items} />
          )}

          {/* 무한 스크롤 감시 지점 */}
          {hasMore && <div ref={sentinelRef} className="h-1" aria-hidden="true" />}

          {isFetchingMore && (
            <div className="mt-4 flex justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            </div>
          )}

          {!hasMore && items.length > 0 && (
            <p className="mt-6 text-center text-sm text-gray-400">모든 기록을 불러왔습니다.</p>
          )}
        </>
      )}
    </section>
  );
}
