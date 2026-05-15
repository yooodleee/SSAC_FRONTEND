'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { HomeV1Data } from '@/types';
import { homeV1Service } from '@/services/homeV1';
import { Button } from '@/components/ui/Button';
import { GreetingSection } from './GreetingSection';
import { TodayCardSection } from './TodayCardSection';
import { ContinueLearningSection } from './ContinueLearningSection';
import { TodayQuizSection } from './TodayQuizSection';
import { RecommendedSection } from './RecommendedSection';
import { CategorySection } from './CategorySection';
import {
  GreetingSkeleton,
  TodayCardSkeleton,
  ContinueLearningSkeleton,
  TodayQuizSkeleton,
  RecommendedSkeleton,
  CategorySkeleton,
} from './HomeV1Skeleton';

// UI-only type
interface FetchError {
  status?: number;
  code?: string;
  message?: string;
  loginRequired?: boolean;
}

const PULL_THRESHOLD = 60;

export function HomeV1() {
  const router = useRouter();
  const [data, setData] = useState<HomeV1Data | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pull to refresh state
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const touchStartYRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const fetchedRef = useRef(false);

  const fetchHome = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await homeV1Service.getHome();

      if (result.onboardingRequired) {
        router.replace('/onboarding/test');
        return;
      }
      if (result.redirectTo) {
        router.replace(result.redirectTo);
        return;
      }

      setData(result);
    } catch (err: unknown) {
      const e = err as FetchError;
      if (e.loginRequired ?? e.status === 401) {
        router.replace('/login');
        return;
      }
      setError(e.message ?? '홈 데이터를 불러오지 못했어요.');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetchHome();
  }, [fetchHome]);

  // Pull to refresh handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      touchStartYRef.current = e.touches[0]?.clientY ?? 0;
      setIsPulling(true);
    }
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isPulling) return;
      const currentY = e.touches[0]?.clientY ?? 0;
      const delta = currentY - touchStartYRef.current;
      if (delta > 0 && window.scrollY === 0) {
        setPullDistance(Math.min(delta, PULL_THRESHOLD * 1.5));
      }
    },
    [isPulling],
  );

  const handleTouchEnd = useCallback(() => {
    if (pullDistance >= PULL_THRESHOLD) {
      void fetchHome();
    }
    setIsPulling(false);
    setPullDistance(0);
  }, [pullDistance, fetchHome]);

  const pullOpacity = Math.min(pullDistance / PULL_THRESHOLD, 1);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <GreetingSkeleton />
        <TodayCardSkeleton />
        <ContinueLearningSkeleton />
        <TodayQuizSkeleton />
        <RecommendedSkeleton />
        <CategorySkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 py-16">
        <p className="text-sm text-[var(--color-text-secondary)]">{error}</p>
        <Button
          variant="primary"
          size="md"
          onClick={() => {
            void fetchHome();
          }}
        >
          다시 시도
        </Button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div
      ref={containerRef}
      className="flex flex-col gap-6"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull to refresh indicator */}
      {pullDistance > 0 && (
        <div
          className="flex items-center justify-center text-xs text-[var(--color-text-secondary)] transition-opacity"
          style={{ opacity: pullOpacity, height: `${pullDistance * 0.5}px` }}
          aria-hidden="true"
        >
          ↓ 당겨서 새로고침
        </div>
      )}

      <GreetingSection
        nickname={data.user.nickname}
        level={data.user.level}
        onLevelBadgeClick={() => {
          router.replace('/my');
        }}
      />

      <TodayCardSection
        todayCard={data.todayCard}
        onCardClick={(id) => {
          router.push(`/content/${id}`);
        }}
      />

      <ContinueLearningSection
        continueLearning={data.continueLearning}
        onContinueClick={(id) => {
          router.push(`/content/${id}`);
        }}
      />

      <TodayQuizSection
        todayQuiz={data.todayQuiz}
        onQuizClick={(id) => {
          router.push(`/quiz?id=${id}`);
        }}
      />

      <RecommendedSection
        items={data.recommendedContents}
        onItemClick={(id) => {
          router.push(`/content/${id}`);
        }}
      />

      <CategorySection
        categories={data.categories}
        onCategoryClick={(id) => {
          router.push(`/content?category=${id}`);
        }}
      />
    </div>
  );
}
