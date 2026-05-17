'use client';

import { Button } from '@/components/ui/Button';

interface WelcomeBackModalProps {
  daysSinceLastVisit: number;
  /** BE 커스텀 메시지. 없으면 기본 메시지 표시 */
  message?: string;
  onClose: () => void;
}

/**
 * 복귀 환영 메시지 모달
 *
 * - API 응답 welcomeBack.isLongAbsence: true 시 표시
 * - 세션 내 1회만 표시 (호출 측에서 sessionStorage 기록)
 * - [시작하기] 확인 후 홈 화면 노출
 */
export function WelcomeBackModal({ daysSinceLastVisit, message, onClose }: WelcomeBackModalProps) {
  const heading = message ?? `${daysSinceLastVisit}일 만에 돌아오셨네요!`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-back-title"
    >
      <div className="w-full max-w-[320px] rounded-3xl bg-white p-8 text-center shadow-xl dark:bg-slate-800">
        <span className="mb-4 block text-5xl" aria-hidden="true">
          🌱
        </span>
        <h2
          id="welcome-back-title"
          className="mb-2 text-lg font-bold text-[var(--color-text-primary)]"
        >
          {heading}
        </h2>
        <p className="mb-6 text-sm text-[var(--color-text-secondary)]">
          우리 다시 시작해볼까요? 😊
        </p>
        <Button size="lg" className="w-full" onClick={onClose}>
          시작하기
        </Button>
      </div>
    </div>
  );
}
