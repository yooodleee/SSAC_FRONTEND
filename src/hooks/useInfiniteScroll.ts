'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { QuizHistoryItem, QuizHistoryPage } from '@/types';
import { fetchQuizHistory } from '@/services/quiz-history';

interface UseInfiniteScrollReturn {
  items: QuizHistoryItem[];
  isLoading: boolean;
  isFetchingMore: boolean;
  hasMore: boolean;
  total: number;
  error: string | null;
  sentinelRef: React.RefCallback<HTMLDivElement>;
}

export function useInfiniteQuizHistory(limit = 10): UseInfiniteScrollReturn {
  const [items, setItems] = useState<QuizHistoryItem[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextPage, setNextPage] = useState(1);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const isFetchingRef = useRef(false);

  useEffect(() => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    let cancelled = false;

    fetchQuizHistory(nextPage, limit)
      .then((result: QuizHistoryPage) => {
        if (cancelled) return;
        setItems((prev) => (nextPage === 1 ? result.items : [...prev, ...result.items]));
        setHasMore(result.hasMore);
        setTotal(result.total);
        setError(null);
      })
      .catch(() => {
        if (cancelled) return;
        setError('퀴즈 기록을 불러오지 못했습니다.');
      })
      .finally(() => {
        isFetchingRef.current = false;
        if (cancelled) return;
        setIsLoading(false);
        setIsFetchingMore(false);
      });

    return () => {
      cancelled = true;
    };
  }, [nextPage, limit]);

  const sentinelRef: React.RefCallback<HTMLDivElement> = useCallback(
    (node) => {
      if (observerRef.current) observerRef.current.disconnect();
      if (!node) return;

      observerRef.current = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (entry?.isIntersecting && hasMore && !isFetchingRef.current) {
            setIsFetchingMore(true);
            setNextPage((p) => p + 1);
          }
        },
        { rootMargin: '200px' },
      );

      observerRef.current.observe(node);
    },
    [hasMore],
  );

  return { items, isLoading, isFetchingMore, hasMore, total, error, sentinelRef };
}
