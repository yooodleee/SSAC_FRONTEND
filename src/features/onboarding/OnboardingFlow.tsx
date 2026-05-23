'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { components } from '@/../api-contract/generated/api-types';
import { onboardingService } from '@/services/onboarding';
import { cn } from '@/lib/utils';

type QuestionDto = components['schemas']['QuestionDto'];
type UserType = 'HIGH_SCHOOL' | 'EARLY_CAREER';
type OnboardingStep = 'type' | 'question' | 'complete';

// UI-only type: not derived from API contract
interface FlowAnswer {
  questionIndex: number;
  optionIndex: number;
}

// UI-only type: not derived from API contract
interface FlowState {
  step: OnboardingStep;
  userType: UserType | null;
  currentQuestion: number; // 1-indexed
  answers: FlowAnswer[];
}

const SESSION_FLOW_KEY = 'onboarding_flow_state';
const SESSION_SUBMIT_KEY = 'onboarding_answers';

function readPersistedFlow(): FlowState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(SESSION_FLOW_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as FlowState;
  } catch {
    return null;
  }
}

function getInitialFlowState(): FlowState {
  const persisted = readPersistedFlow();
  if (!persisted || persisted.step === 'complete') {
    return { step: 'type', userType: null, currentQuestion: 1, answers: [] };
  }
  return persisted;
}

// ─── SVG Chevrons ────────────────────────────────────────────────────────────

function ChevronLeft() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

// ─── Option Button ────────────────────────────────────────────────────────────

interface OptionButtonProps {
  label: string;
  selected: boolean;
  onClick: () => void;
}

function OptionButton({ label, selected, onClick }: OptionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full min-h-[48px] rounded-lg border px-4 py-3 text-left text-sm font-medium text-white',
        'transition-colors [transition-duration:200ms]',
        'motion-reduce:transition-none',
        selected
          ? 'border-[#1B4332] bg-[#1B4332]'
          : 'border-white/20 bg-white/10 hover:bg-white/15',
      )}
      aria-pressed={selected}
    >
      {label}
    </button>
  );
}

// ─── Type Step ───────────────────────────────────────────────────────────────

interface TypeStepProps {
  userType: UserType | null;
  onSelect: (type: UserType) => void;
}

function TypeStep({ userType, onSelect }: TypeStepProps) {
  return (
    <div className="flex flex-col gap-6">
      <p className="text-center font-bold text-white" style={{ fontSize: '22px' }}>
        사용자 유형을 선택해주세요
      </p>
      <div className="flex flex-col gap-3">
        <OptionButton
          label="수능이 끝난 고등학교 3학년이에요"
          selected={userType === 'HIGH_SCHOOL'}
          onClick={() => onSelect('HIGH_SCHOOL')}
        />
        <OptionButton
          label="사회초년생이에요"
          selected={userType === 'EARLY_CAREER'}
          onClick={() => onSelect('EARLY_CAREER')}
        />
      </div>
    </div>
  );
}

// ─── Question Step ───────────────────────────────────────────────────────────

interface QuestionStepProps {
  question: QuestionDto | undefined;
  currentQuestion: number;
  totalQuestions: number;
  selectedOptionIndex: number | null;
  onSelect: (optionIndex: number) => void;
  isLoading: boolean;
}

const OPTION_LABELS = ['①', '②', '③', '④', '⑤'];

function QuestionStep({
  question,
  currentQuestion,
  totalQuestions,
  selectedOptionIndex,
  onSelect,
  isLoading,
}: QuestionStepProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="h-1.5 w-full animate-pulse rounded-full bg-white/20" />
        <div className="h-5 w-3/4 animate-pulse rounded bg-white/20" />
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-[48px] animate-pulse rounded-lg bg-white/10" />
        ))}
      </div>
    );
  }

  if (!question) return null;

  return (
    <div className="flex flex-col gap-6">
      {/* Progress bar */}
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-white/20"
        role="progressbar"
        aria-valuenow={currentQuestion}
        aria-valuemin={1}
        aria-valuemax={totalQuestions}
        aria-label={`${totalQuestions}문제 중 ${currentQuestion}번째`}
      >
        <div
          className="h-full rounded-full bg-[#4CAF82] transition-all duration-300 motion-reduce:transition-none"
          style={{ width: `${(currentQuestion / totalQuestions) * 100}%` }}
        />
      </div>

      {/* Question */}
      <p className="text-base font-medium leading-relaxed text-white">Q. {question.content}</p>

      {/* Options */}
      <div className="flex flex-col gap-3">
        {(question.options ?? []).map((opt, idx) => (
          <OptionButton
            key={opt.id ?? idx}
            label={`${OPTION_LABELS[idx] ?? `(${idx + 1})`} ${opt.label ?? ''}`}
            selected={selectedOptionIndex === idx}
            onClick={() => onSelect(idx)}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Complete Step (Login Prompt) ─────────────────────────────────────────────

function CompleteStep({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="flex min-h-full flex-col">
      <div className="flex flex-1 items-center justify-center">
        <p className="text-center text-white" style={{ fontSize: '22px', fontWeight: 700 }}>
          지금 로그인하고
          <br />
          점수를 확인하세요
        </p>
      </div>
      <button
        type="button"
        onClick={onLogin}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[calc(100%-40px)] max-w-[390px] rounded-lg font-semibold text-white"
        style={{ backgroundColor: '#1B4332', height: '48px' }}
      >
        로그인
      </button>
    </div>
  );
}

// ─── Main OnboardingFlow ──────────────────────────────────────────────────────

export function OnboardingFlow() {
  const router = useRouter();

  // Lazy-initialize state from sessionStorage to avoid setState-in-effect
  const [flowState, setFlowState] = useState<FlowState>(getInitialFlowState);

  const [questions, setQuestions] = useState<QuestionDto[] | null>(null);
  // Start loading immediately if restoring to 'question' step (avoids setState-in-effect)
  const [isLoadingQuestions, setIsLoadingQuestions] = useState<boolean>(() => {
    const persisted = readPersistedFlow();
    return !!(persisted && persisted.step === 'question' && persisted.userType);
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { step, userType, currentQuestion, answers } = flowState;

  // Persist flow state to sessionStorage on every change
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    sessionStorage.setItem(SESSION_FLOW_KEY, JSON.stringify(flowState));
  }, [flowState]);

  // If restored to 'question' step, fetch questions on mount
  // Fetch questions on mount if restoring to 'question' step
  const didFetchRef = useRef(false);
  useEffect(() => {
    if (didFetchRef.current) return;
    if (step === 'question' && userType) {
      didFetchRef.current = true;
      onboardingService
        .getQuestions(userType)
        .then((data) => setQuestions(data.questions ?? []))
        .catch(() => setToastMessage('문제를 불러오지 못했어요.'))
        .finally(() => setIsLoadingQuestions(false));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-dismiss toast
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 2000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const totalQuestions = questions?.length ?? 5;
  const currentIdx = currentQuestion - 1;
  const currentQ = questions?.[currentIdx];
  const isLastQuestion = currentQuestion === totalQuestions;
  const currentAnswer = answers.find((a) => a.questionIndex === currentIdx);

  function updateFlow(patch: Partial<FlowState>) {
    setFlowState((prev) => ({ ...prev, ...patch }));
  }

  function handleSelectOption(optionIndex: number) {
    updateFlow({
      answers: [
        ...answers.filter((a) => a.questionIndex !== currentIdx),
        { questionIndex: currentIdx, optionIndex },
      ],
    });
  }

  function handleNext() {
    if (step === 'type') {
      if (!userType) {
        setToastMessage('유형을 선택해주세요');
        return;
      }
      // Fetch questions then advance
      setIsLoadingQuestions(true);
      didFetchRef.current = true;
      onboardingService
        .getQuestions(userType)
        .then((data) => {
          setQuestions(data.questions ?? []);
          updateFlow({ step: 'question', currentQuestion: 1 });
        })
        .catch(() => setToastMessage('문제를 불러오지 못했어요. 잠시 후 다시 시도해주세요.'))
        .finally(() => setIsLoadingQuestions(false));
      return;
    }

    if (step === 'question') {
      if (!currentAnswer) {
        setToastMessage('답변을 선택해주세요');
        return;
      }
      if (!isLastQuestion) {
        updateFlow({ currentQuestion: currentQuestion + 1 });
        return;
      }
      // All questions answered — save for post-login submission
      sessionStorage.setItem(
        SESSION_SUBMIT_KEY,
        JSON.stringify({
          userType,
          answers: answers.map((a) => ({
            questionIndex: a.questionIndex,
            optionIndex: a.optionIndex,
          })),
        }),
      );
      updateFlow({ step: 'complete' });
    }
  }

  function handlePrev() {
    if (step === 'type') {
      router.push('/');
      return;
    }
    if (step === 'question') {
      if (currentQuestion === 1) {
        updateFlow({ step: 'type' });
        return;
      }
      updateFlow({ currentQuestion: currentQuestion - 1 });
      return;
    }
    if (step === 'complete') {
      updateFlow({ step: 'question', currentQuestion: totalQuestions });
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex min-h-full flex-col">
      {/* Image section — 25vh with dark overlay */}
      <div className="relative flex-shrink-0" style={{ height: '25vh' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/hero-bg.png"
          alt=""
          aria-hidden="true"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
        {/* Overlay */}
        <div
          className="absolute inset-0"
          aria-hidden="true"
          style={{ background: 'rgba(0, 0, 0, 0.4)' }}
        />

        {/* Chevron navigation bar (overlaid at top of image) */}
        <div className="absolute left-0 right-0 top-0 flex items-center justify-between px-4 py-3 text-white">
          {/* Left chevron — prev */}
          <button
            type="button"
            onClick={handlePrev}
            aria-label="이전"
            className="rounded p-1 transition-colors duration-200 hover:bg-white/10 active:bg-white/20 motion-reduce:transition-none"
          >
            <ChevronLeft />
          </button>

          {/* Right: progress counter + next chevron or 완료 button */}
          <div className="flex items-center gap-2">
            {step === 'question' && (
              <span className="text-sm font-medium" aria-hidden="true">
                {currentQuestion} / {totalQuestions}
              </span>
            )}

            {step === 'question' && isLastQuestion ? (
              <button
                type="button"
                onClick={handleNext}
                className="font-semibold text-white transition-[filter] duration-200 hover:brightness-110 active:brightness-90 motion-reduce:transition-none"
                style={{
                  backgroundColor: '#1B4332',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  fontSize: '14px',
                }}
              >
                완료
              </button>
            ) : step !== 'complete' ? (
              <button
                type="button"
                onClick={handleNext}
                aria-label="다음"
                className="rounded p-1 transition-colors duration-200 hover:bg-white/10 active:bg-white/20 motion-reduce:transition-none"
              >
                <ChevronRight />
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Dark content section */}
      <div
        className="flex flex-1 flex-col px-5 py-8"
        style={{ backgroundColor: '#1A1A1A', color: '#FFFFFF' }}
      >
        {step === 'type' && (
          <TypeStep userType={userType} onSelect={(t) => updateFlow({ userType: t })} />
        )}
        {step === 'question' && (
          <QuestionStep
            question={currentQ}
            currentQuestion={currentQuestion}
            totalQuestions={totalQuestions}
            selectedOptionIndex={currentAnswer?.optionIndex ?? null}
            onSelect={handleSelectOption}
            isLoading={isLoadingQuestions}
          />
        )}
        {step === 'complete' && <CompleteStep onLogin={() => router.push('/login')} />}
      </div>

      {/* Toast */}
      {toastMessage && (
        <div
          role="alert"
          aria-live="assertive"
          className="fixed bottom-24 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/80 px-4 py-2 text-sm text-white backdrop-blur-sm"
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
}
