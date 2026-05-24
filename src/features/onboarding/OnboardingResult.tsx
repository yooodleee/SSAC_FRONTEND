/* eslint-disable @next/next/no-img-element */
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { onboardingService, type OnboardingResultBffResponse } from '@/services/onboarding';
import { LandingHeader } from '@/components/layout/LandingHeader';

type Level = 'SEED' | 'SPROUT' | 'TREE';

const LEVEL_CONFIG: Record<Level, { label: string; desc: string; image: string }> = {
  SEED: {
    label: '씨앗',
    desc: '금융이 완전 처음이어도 괜찮아요',
    image: '/images/level-seed.png',
  },
  SPROUT: {
    label: '새싹',
    desc: '조금은 알고 있어요',
    image: '/images/level-sprout.png',
  },
  TREE: {
    label: '나무',
    desc: '어느 정도 알고 있어요',
    image: '/images/level-tree.png',
  },
};

const FALLBACK_IMAGE = '/images/hello.png';

// ─── 로딩 스켈레톤 ───────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <>
      {/* 이미지 영역 스켈레톤 */}
      <div
        className="animate-pulse motion-reduce:animate-none flex-shrink-0"
        style={{ height: '25vh', backgroundColor: '#2A2A2A' }}
        aria-hidden="true"
      />

      {/* 텍스트 + 버튼 스켈레톤 */}
      <div
        className="flex flex-1 flex-col items-center justify-center gap-6 px-5 py-10"
        aria-busy="true"
        aria-label="결과 로딩 중"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-64 animate-pulse rounded-lg bg-[#2A2A2A] motion-reduce:animate-none" />
          <div className="h-5 w-48 animate-pulse rounded bg-[#2A2A2A] motion-reduce:animate-none" />
          <div className="h-5 w-56 animate-pulse rounded bg-[#2A2A2A] motion-reduce:animate-none" />
        </div>
        <div className="h-12 w-64 animate-pulse rounded-xl bg-[#2A2A2A] motion-reduce:animate-none" />
      </div>
    </>
  );
}

// ─── 에러 뷰 ─────────────────────────────────────────────────────────────────

interface ErrorViewProps {
  message: string;
  onRetry: () => void;
}

function ErrorView({ message, onRetry }: ErrorViewProps) {
  return (
    <div
      className="flex flex-1 flex-col items-center justify-center gap-4 px-5 py-10 text-center"
      role="alert"
    >
      <p className="whitespace-pre-line text-base leading-relaxed text-white">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className={cn(
          'min-h-[48px] rounded-xl px-6 py-3 text-base font-medium text-white',
          'bg-[#1B4332] hover:bg-[#145229]',
          'transition-[background] duration-200 ease-in-out motion-reduce:transition-none',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50',
        )}
      >
        재시도
      </button>
    </div>
  );
}

// ─── 결과 뷰 ─────────────────────────────────────────────────────────────────

interface ResultViewProps {
  result: OnboardingResultBffResponse;
  onCta: () => void;
}

function ResultView({ result, onCta }: ResultViewProps) {
  const [imgFailed, setImgFailed] = useState(false);

  const level = (result.level as Level) ?? 'SEED';
  const cfg = LEVEL_CONFIG[level] ?? LEVEL_CONFIG.SEED;
  const levelLabel = result.levelLabel ?? cfg.label;
  const levelDesc = result.levelDescription ?? cfg.desc;
  const nickname = result.nickname ?? '';
  const bgSrc = imgFailed ? FALLBACK_IMAGE : cfg.image;

  return (
    <>
      {/* 배경 이미지 영역 — /onboarding 페이지와 동일 */}
      <div className="relative flex-shrink-0" style={{ height: '25vh' }}>
        <img
          src={bgSrc}
          alt=""
          aria-hidden="true"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          onError={() => setImgFailed(true)}
        />
        <div
          className="absolute inset-0"
          aria-hidden="true"
          style={{ background: 'rgba(0, 0, 0, 0.4)' }}
        />
      </div>

      {/* 텍스트 + CTA 영역 */}
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-5 py-10 text-center">
        <div className="flex flex-col gap-3">
          <p style={{ fontSize: '22px', fontWeight: 700, lineHeight: 1.3, color: '#FFFFFF' }}>
            <span style={{ color: '#1B4332' }}>{nickname}</span>
            님은 금융 <span style={{ color: '#1B4332' }}>{levelLabel}</span>
            이에요!
          </p>
          <p style={{ fontSize: '16px', lineHeight: 1.6, color: '#FFFFFF' }}>{levelDesc}</p>
          <p style={{ fontSize: '16px', lineHeight: 1.6, color: '#FFFFFF' }}>
            걱정 마세요, SSAC이 차근차근 도와드릴게요
          </p>
        </div>

        <button
          type="button"
          onClick={onCta}
          className={cn(
            'min-h-[48px] rounded-xl px-8 py-4 text-base font-medium text-white',
            'bg-[#1B4332] hover:bg-[#145229]',
            'transition-[background] duration-200 ease-in-out motion-reduce:transition-none',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50',
          )}
        >
          나의 학습 공간으로 이동하기 →
        </button>
      </div>
    </>
  );
}

// ─── 메인 컴포넌트 ────────────────────────────────────────────────────────────

export function OnboardingResult() {
  const router = useRouter();

  const [result, setResult] = useState<OnboardingResultBffResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const fetchedRef = useRef(false);

  const loadResult = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const data = await onboardingService.getResult();
      if (!data.onboardingCompleted) {
        router.replace('/onboarding');
        return;
      }
      setResult(data);
    } catch (err) {
      const error = err as { code?: string; loginRequired?: boolean; status?: number };

      if (error.loginRequired || error.status === 401) {
        router.replace('/login');
        return;
      }
      if (error.status === 404 || error.code === 'ONBOARDING-006') {
        router.replace('/onboarding');
        return;
      }
      if (error.code === 'ONBOARDING-002') {
        router.replace('/home');
        return;
      }
      setFetchError('결과를 불러오지 못했어요.\n잠시 후 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    loadResult();
  }, [loadResult]);

  function handleCta() {
    router.replace('/home');
  }

  return (
    <>
      <LandingHeader isLoggedIn={true} />

      <div
        style={{
          minHeight: '100vh',
          paddingTop: '64px',
          backgroundColor: '#1A1A1A',
          color: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {isLoading ? (
          <LoadingSkeleton />
        ) : fetchError ? (
          <ErrorView
            message={fetchError}
            onRetry={() => {
              fetchedRef.current = false;
              loadResult();
            }}
          />
        ) : result ? (
          <ResultView result={result} onCta={handleCta} />
        ) : null}
      </div>
    </>
  );
}
