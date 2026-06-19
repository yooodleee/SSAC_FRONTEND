'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { HomeV1Data } from '@/types';
import { homeV1Service } from '@/services/homeV1';
import { levelUpStore } from '@/lib/levelUpStore';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { GreetingSection } from './GreetingSection';
import { TodayCardSection } from './TodayCardSection';
import { ContinueLearningSection } from './ContinueLearningSection';
import { TodayQuizSection } from './TodayQuizSection';
import { RecommendedSection } from './RecommendedSection';
import { CategorySection } from './CategorySection';
import { WelcomeBackModal } from './WelcomeBackModal';
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
/** 복귀 환영 메시지 세션 내 1회 표시를 위한 sessionStorage 키 */
const WELCOME_BACK_KEY = 'welcomeBackShown';

export function HomeV1() {
  const router = useRouter();
  const [data, setData] = useState<HomeV1Data | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  /** 기존 데이터를 유지한 채 백그라운드에서 최신 데이터를 가져오는 중 */
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);

  // Pull to refresh state
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const touchStartYRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const fetchedRef = useRef(false);

  /**
   * 홈 데이터 로드
   *
   * mode 'initial' : 스켈레톤 표시, 에러 시 에러 UI 노출
   * mode 'background': 기존 데이터 유지, 에러 시 조용히 실패
   */
  const fetchHome = useCallback(
    async (mode: 'initial' | 'background' = 'initial') => {
      if (mode === 'background') {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
        setError(null);
      }

      try {
        const result = await homeV1Service.getHome();

        // 라우트 가드 (API 응답 기반)
        if (result.onboardingRequired) {
          router.replace('/onboarding/test');
          return;
        }
        if (result.redirectTo) {
          router.replace(result.redirectTo);
          return;
        }

        setData(result);

        // 복귀 환영 메시지: 초기 로드 + 세션 내 미표시 시에만 노출
        if (
          mode === 'initial' &&
          result.welcomeBack?.isLongAbsence &&
          !sessionStorage.getItem(WELCOME_BACK_KEY)
        ) {
          setShowWelcomeBack(true);
        }
      } catch (err: unknown) {
        const e = err as FetchError;
        if (e.loginRequired ?? e.status === 401) {
          // api.ts(request)가 이미 window.location.href 를 통해 /login?redirectTo=... 으로
          // 리다이렉트를 예약한다. 여기서 router.replace('/login') 을 추가로 호출하면
          // redirectTo 없는 소프트 네비게이션이 하드 리다이렉트보다 먼저 실행되어
          // 세션 복원 후 /home 으로 잘못 이동하는 문제가 발생하므로 중복 호출을 제거한다.
          return;
        }
        // 백그라운드 갱신 실패: 기존 데이터 유지, 에러 UI 미표시
        if (mode === 'initial') {
          setError(e.message ?? '홈 데이터를 불러오지 못했어요.');
        }
      } finally {
        if (mode === 'background') {
          setIsRefreshing(false);
        } else {
          setIsLoading(false);
        }
      }
    },
    [router],
  );

  // 최초 로드
  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetchHome();
  }, [fetchHome]);

  // visibilitychange: 탭 복귀 시 백그라운드 갱신
  // → 콘텐츠 완료 / 퀴즈 완료 후 홈 화면 복귀 시 자동 갱신 포함
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        void fetchHome('background');
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [fetchHome]);

  // levelUpStore: 레벨업 모달 닫힘 후 백그라운드 갱신
  // → 레벨업 기준 추천 콘텐츠를 최신 데이터로 갱신
  useEffect(() => {
    return levelUpStore.subscribe((payload) => {
      if (payload === null) {
        void fetchHome('background');
      }
    });
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
      // 기존 데이터 유지하며 백그라운드 갱신
      void fetchHome('background');
    }
    setIsPulling(false);
    setPullDistance(0);
  }, [pullDistance, fetchHome]);

  const handleWelcomeBackClose = useCallback(() => {
    sessionStorage.setItem(WELCOME_BACK_KEY, '1');
    setShowWelcomeBack(false);
  }, []);

  const pullOpacity = Math.min(pullDistance / PULL_THRESHOLD, 1);

  // ─── Loading / Error states ───────────────────────────────────────────────

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

  // ─── Main UI ──────────────────────────────────────────────────────────────

  return (
    <>
      {/* 복귀 환영 메시지 모달 */}
      {showWelcomeBack && data.welcomeBack && (
        <WelcomeBackModal
          daysSinceLastVisit={data.welcomeBack.daysSinceLastVisit}
          message={data.welcomeBack.message}
          onClose={handleWelcomeBackClose}
        />
      )}

      {/* 백그라운드 갱신 인디케이터 — 기존 콘텐츠 유지하며 상단 슬림바로 표시 */}
      {isRefreshing && (
        <div
          className="fixed left-0 right-0 top-16 z-40 h-0.5 animate-pulse bg-[var(--color-primary)]"
          role="status"
          aria-label="데이터 갱신 중"
        />
      )}

      <div
        ref={containerRef}
        className={cn('flex flex-col gap-6')}
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
    </>
  );
}
