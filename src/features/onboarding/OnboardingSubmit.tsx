/* eslint-disable @next/next/no-img-element */
'use client';

/**
 * OnboardingSubmit — 로그인 후 온보딩 자동 제출 처리 컴포넌트
 *
 * sessionStorage의 'onboarding_answers'를 읽어 BE에 제출 후
 * /onboarding/result 또는 /home으로 이동합니다.
 */

import { Suspense, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { onboardingService } from '@/services/onboarding';

// UI-only type: not derived from API contract
interface StoredAnswer {
  questionIndex: number;
  optionIndex: number;
}

// UI-only type: not derived from API contract
interface StoredOnboardingAnswers {
  userType: 'HIGH_SCHOOL' | 'EARLY_CAREER';
  answers: StoredAnswer[];
}

const prefersReducedMotion =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function Spinner() {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: '#1A1A1A',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
      role="status"
      aria-label="온보딩 결과를 처리하는 중입니다."
    >
      {prefersReducedMotion ? (
        <img src="/gress.png" alt="SSAC" width={80} height={80} />
      ) : (
        <img src="/assets/ssac-loading.gif" alt="로딩 중" width={200} height={200} />
      )}
    </div>
  );
}

function OnboardingSubmitContent() {
  const router = useRouter();
  const calledRef = useRef(false);

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;

    const raw = sessionStorage.getItem('onboarding_answers');
    if (!raw) {
      router.replace('/home');
      return;
    }

    let stored: StoredOnboardingAnswers;
    try {
      stored = JSON.parse(raw) as StoredOnboardingAnswers;
    } catch {
      sessionStorage.removeItem('onboarding_answers');
      router.replace('/home');
      return;
    }

    // Fetch questions (authenticated — uses account's userType)
    onboardingService
      .getQuestions()
      .then((data) => {
        const questions = data.questions ?? [];
        if (!questions.length) {
          sessionStorage.removeItem('onboarding_answers');
          router.replace('/home');
          return null;
        }

        // Map stored {questionIndex, optionIndex} to actual BE IDs
        const mappedAnswers = stored.answers
          .map((a) => {
            const q = questions[a.questionIndex];
            if (!q || q.id === undefined) return null;
            const opt = (q.options ?? [])[a.optionIndex];
            if (!opt?.id) return null;
            return { questionId: q.id, selectedOption: opt.id };
          })
          .filter((a): a is { questionId: number; selectedOption: string } => a !== null);

        if (!mappedAnswers.length) {
          sessionStorage.removeItem('onboarding_answers');
          router.replace('/home');
          return null;
        }

        return onboardingService.submitAnswers({ answers: mappedAnswers });
      })
      .then((result) => {
        if (result === null || result === undefined) return;
        sessionStorage.removeItem('onboarding_answers');
        sessionStorage.removeItem('onboarding_flow_state');
        router.replace('/onboarding/result');
      })
      .catch(() => {
        sessionStorage.removeItem('onboarding_answers');
        router.replace('/home');
      });
  }, [router]);

  return <Spinner />;
}

export function OnboardingSubmit() {
  return (
    <Suspense fallback={<Spinner />}>
      <OnboardingSubmitContent />
    </Suspense>
  );
}
