'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { components } from '@/../api-contract/generated/api-types';
import { onboardingService } from '@/services/onboarding';
import { getErrorMessage } from '@/lib/errorMessages';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { ProgressIndicator } from './ProgressIndicator';
import { SkipConfirmDialog } from './SkipConfirmDialog';
import { OnboardingTestSkeleton } from './OnboardingTestSkeleton';

type QuestionDto = components['schemas']['QuestionDto'];
type OptionDto = components['schemas']['OptionDto'];
type Answer = components['schemas']['Answer'];

const OPTION_LABELS = ['①', '②', '③', '④', '⑤'];
const SESSION_KEY_INDEX = 'onboardingCurrentIndex';
const SESSION_KEY_ANSWERS = 'onboardingAnswers';

function readPersistedState(): { index: number; answers: Answer[] } {
  if (typeof window === 'undefined') return { index: 0, answers: [] };
  try {
    const raw = sessionStorage.getItem(SESSION_KEY_INDEX);
    const index = raw !== null ? parseInt(raw, 10) : 0;
    const answers = JSON.parse(sessionStorage.getItem(SESSION_KEY_ANSWERS) ?? '[]') as Answer[];
    return { index: isNaN(index) ? 0 : index, answers };
  } catch {
    return { index: 0, answers: [] };
  }
}

function clearPersistedState() {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(SESSION_KEY_INDEX);
  sessionStorage.removeItem(SESSION_KEY_ANSWERS);
}

export function OnboardingTest() {
  const router = useRouter();

  const [questions, setQuestions] = useState<QuestionDto[] | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSkipDialog, setShowSkipDialog] = useState(false);
  // Transition: visible controls opacity/translate
  const [visible, setVisible] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const fetchedRef = useRef(false);

  const loadQuestions = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const data = await onboardingService.getQuestions();
      const qs = data.questions ?? [];
      setQuestions(qs);

      // Restore persisted progress
      const { index, answers: savedAnswers } = readPersistedState();
      setCurrentIndex(index < qs.length ? index : 0);
      setAnswers(savedAnswers);
    } catch (err) {
      const error = err as { code?: string; loginRequired?: boolean; status?: number };
      if (error.loginRequired || error.status === 401) {
        // 비로그인 사용자 → 새 온보딩 플로우로 이동
        router.replace('/onboarding');
        return;
      }
      if (error.code === 'ONBOARDING-001') {
        router.replace('/signup/type');
        return;
      }
      if (error.code === 'ONBOARDING-002') {
        // 온보딩 이미 완료 — auto-login 게이트웨이(/) 경유 시 무한 루프 발생하므로 /home으로 직접 이동
        router.replace('/home');
        return;
      }
      setFetchError('문제를 불러오지 못했어요. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    loadQuestions();
  }, [loadQuestions]);

  // Persist progress to sessionStorage on change
  useEffect(() => {
    if (typeof window === 'undefined' || isLoading) return;
    sessionStorage.setItem(SESSION_KEY_INDEX, String(currentIndex));
    sessionStorage.setItem(SESSION_KEY_ANSWERS, JSON.stringify(answers));
  }, [currentIndex, answers, isLoading]);

  const totalQuestions = questions?.length ?? 0;
  const currentQuestion: QuestionDto | undefined = questions?.[currentIndex];
  const isLastQuestion = totalQuestions > 0 && currentIndex === totalQuestions - 1;
  const selectedOptionId =
    currentQuestion?.id !== undefined
      ? (answers.find((a) => a.questionId === currentQuestion.id)?.selectedOption ?? null)
      : null;

  function handleSelectOption(optionId: string) {
    if (!currentQuestion?.id || isTransitioning) return;
    setAnswers((prev) => [
      ...prev.filter((a) => a.questionId !== currentQuestion.id),
      { questionId: currentQuestion.id!, selectedOption: optionId },
    ]);
  }

  function triggerTransition(onSwitch: () => void) {
    setIsTransitioning(true);
    setVisible(false);
    setTimeout(() => {
      onSwitch();
      setVisible(true);
      setIsTransitioning(false);
    }, 300);
  }

  async function handleNext() {
    if (!selectedOptionId || isTransitioning || isSubmitting) return;

    if (!isLastQuestion) {
      triggerTransition(() => setCurrentIndex((i) => i + 1));
      return;
    }

    // Last question — submit all answers
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await onboardingService.submitAnswers({ answers });
      clearPersistedState();
      router.push('/onboarding/result');
    } catch (err) {
      const error = err as { code?: string };
      setSubmitError(getErrorMessage(error.code));
      setIsSubmitting(false);
    }
  }

  async function handleSkipConfirm() {
    setShowSkipDialog(false);
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await onboardingService.skipOnboarding();
      clearPersistedState();
      router.push('/onboarding/result');
    } catch (err) {
      const error = err as { code?: string };
      setSubmitError(getErrorMessage(error.code));
      setIsSubmitting(false);
    }
  }

  function handleRetry() {
    fetchedRef.current = false;
    loadQuestions();
  }

  // ─── Loading / Error states ───────────────────────────────────────────────

  if (isLoading) return <OnboardingTestSkeleton />;

  if (fetchError) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <p className="text-[var(--color-text-secondary)]">{fetchError}</p>
        <Button variant="secondary" onClick={handleRetry}>
          다시 시도
        </Button>
      </div>
    );
  }

  if (!currentQuestion) return null;

  // ─── Main UI ──────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-6">
      {/* Progress row */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-[var(--color-text-secondary)]">
          {currentIndex + 1} / {totalQuestions}
        </span>
        <ProgressIndicator current={currentIndex + 1} total={totalQuestions} />
      </div>

      {/* Question block — fade/slide transition */}
      <div
        className={cn(
          'transition-all duration-300 ease-in-out',
          visible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0',
        )}
      >
        <div className="mb-4">
          <p className="text-lg font-bold text-[var(--color-text-primary)]">
            금융 지식을 알아볼게요! 🌱
          </p>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            부담 갖지 말고 아는 만큼만!
          </p>
        </div>

        <p className="mb-4 text-base font-medium text-[var(--color-text-primary)]">
          Q. {currentQuestion.content}
        </p>

        <div className="flex flex-col gap-3">
          {(currentQuestion.options ?? []).map((opt: OptionDto, idx: number) => (
            <button
              key={opt.id ?? idx}
              type="button"
              onClick={() => opt.id && handleSelectOption(opt.id)}
              disabled={isSubmitting}
              className={cn(
                'flex min-h-[48px] items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-colors',
                selectedOptionId === opt.id
                  ? 'border-[#4CAF82] bg-[#E8F5EE]'
                  : 'border-[var(--color-border)] bg-[var(--color-bg-card)] hover:border-[#4CAF82]/50',
              )}
              aria-pressed={selectedOptionId === opt.id}
            >
              <span className="text-sm font-medium text-[var(--color-text-secondary)]">
                {OPTION_LABELS[idx] ?? `(${idx + 1})`}
              </span>
              <span className="flex-1 text-sm text-[var(--color-text-primary)]">{opt.label}</span>
              {selectedOptionId === opt.id && (
                <svg
                  className="h-5 w-5 flex-shrink-0 text-[#4CAF82]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Submit error */}
      {submitError && (
        <p role="alert" className="text-center text-sm text-[var(--color-danger)]">
          {submitError}
        </p>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="md"
          onClick={() => setShowSkipDialog(true)}
          disabled={isSubmitting}
        >
          건너뛰기
        </Button>
        <Button
          size="lg"
          className="flex-1"
          disabled={!selectedOptionId || isSubmitting || isTransitioning}
          isLoading={isSubmitting}
          onClick={handleNext}
        >
          {isLastQuestion ? '결과 보기' : '다음 →'}
        </Button>
      </div>

      {/* Skip confirm dialog */}
      {showSkipDialog && (
        <SkipConfirmDialog
          onConfirm={handleSkipConfirm}
          onCancel={() => setShowSkipDialog(false)}
        />
      )}
    </div>
  );
}
