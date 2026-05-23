'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LandingHeader } from '@/components/layout/LandingHeader';
import { cn } from '@/lib/utils';

type UserType = 'HIGH_SCHOOL' | 'EARLY_CAREER';

const SESSION_FLOW_KEY = 'onboarding_flow_state';
const SESSION_USER_TYPE_KEY = 'onboarding_user_type';

// UI-only type: not derived from API contract
interface FlowState {
  userType: UserType | null;
}

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
  if (!persisted) return { userType: null };
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
  centered?: boolean;
}

function OptionButton({ label, selected, onClick, centered = false }: OptionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full min-h-[48px] rounded-lg border px-4 py-3 text-sm font-medium text-white',
        'transition-colors [transition-duration:200ms]',
        'motion-reduce:transition-none',
        centered ? 'text-center' : 'text-left',
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
    <div className="flex flex-col items-center gap-6">
      <p className="text-center font-bold text-white" style={{ fontSize: '22px' }}>
        사용자 유형을 선택해주세요
      </p>
      {/* 버튼 폭 2.5배 확장, 화면 중앙 배치 */}
      <div className="flex w-full max-w-[650px] flex-col gap-3">
        <OptionButton
          label="수능이 끝난 고등학교 3학년이에요"
          selected={userType === 'HIGH_SCHOOL'}
          onClick={() => onSelect('HIGH_SCHOOL')}
          centered
        />
        <OptionButton
          label="사회초년생이에요"
          selected={userType === 'EARLY_CAREER'}
          onClick={() => onSelect('EARLY_CAREER')}
          centered
        />
      </div>
    </div>
  );
}

// ─── Main OnboardingFlow ──────────────────────────────────────────────────────

export function OnboardingFlow({ isLoggedIn }: { isLoggedIn: boolean }) {
  const router = useRouter();

  // Lazy-initialize state from sessionStorage to avoid setState-in-effect
  const [flowState, setFlowState] = useState<FlowState>(getInitialFlowState);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { userType } = flowState;

  // Persist flow state to sessionStorage on every change
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    sessionStorage.setItem(SESSION_FLOW_KEY, JSON.stringify(flowState));
  }, [flowState]);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 2000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  function handleNext() {
    if (!userType) {
      setToastMessage('유형을 선택해주세요');
      return;
    }
    sessionStorage.setItem(SESSION_USER_TYPE_KEY, userType);
    router.push('/onboarding/test');
  }

  function handlePrev() {
    router.push('/');
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      {/* LandingHeader: fixed bg-black, z-50, h-16(64px) */}
      <LandingHeader isLoggedIn={isLoggedIn} />

      <div
        className="flex flex-col"
        style={{ minHeight: '100vh', paddingTop: '64px', backgroundColor: '#1A1A1A' }}
      >
        {/* Image section — 25vh with dark overlay */}
        <div className="relative flex-shrink-0" style={{ height: '25vh' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/onboarding.png"
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
            <button
              type="button"
              onClick={handlePrev}
              aria-label="이전"
              className="rounded p-1 transition-colors duration-200 hover:bg-white/10 active:bg-white/20 motion-reduce:transition-none"
            >
              <ChevronLeft />
            </button>

            <button
              type="button"
              onClick={handleNext}
              aria-label="다음"
              className="rounded p-1 transition-colors duration-200 hover:bg-white/10 active:bg-white/20 motion-reduce:transition-none"
            >
              <ChevronRight />
            </button>
          </div>
        </div>

        {/* Dark content section */}
        <div
          className="flex flex-1 flex-col px-5 py-8"
          style={{ backgroundColor: '#1A1A1A', color: '#FFFFFF' }}
        >
          <TypeStep
            userType={userType}
            onSelect={(t) => setFlowState((prev) => ({ ...prev, userType: t }))}
          />
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
    </>
  );
}
