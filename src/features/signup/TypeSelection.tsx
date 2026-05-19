'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { signupService } from '@/services/signup';
import { getErrorMessage } from '@/lib/errorMessages';
import { cn } from '@/lib/utils';
import type { UserType } from '@/types';

// UI-only type: not derived from API contract
interface TypeOption {
  value: UserType;
  emoji: string;
  label: string;
}

const TYPE_OPTIONS: TypeOption[] = [
  { value: 'HIGH_SCHOOL', emoji: '🎓', label: '수능 끝난\n고3이에요' },
  { value: 'EARLY_CAREER', emoji: '💼', label: '사회초년생\n이에요' },
];

export function TypeSelection() {
  const router = useRouter();

  // sessionStorage에서 직접 초기화 — effect에서 setState 호출 방지
  const [nickname] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem('signupNickname');
  });

  const [selected, setSelected] = useState<UserType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const guardedRef = useRef(false);

  // 라우트 가드: signupTempToken 또는 signupNickname 미존재 시 /login 리다이렉트
  useEffect(() => {
    if (guardedRef.current) return;
    guardedRef.current = true;

    const tempToken = sessionStorage.getItem('signupTempToken');
    if (!tempToken || !nickname) {
      router.replace('/login');
    }
  }, [router, nickname]);

  async function handleSubmit() {
    if (!selected || isSubmitting || !nickname) return;
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await signupService.completeSignup({ nickname, userType: selected });
      // 회원가입 완료 — 임시 데이터 전체 삭제
      sessionStorage.removeItem('signupTempToken');
      sessionStorage.removeItem('signupProvider');
      sessionStorage.removeItem('signupNickname');
      // hard redirect — Header(Server Component)가 새 accessToken 쿠키를 반드시 읽도록 강제
      window.location.replace('/home');
    } catch (err) {
      const code = (err as { code?: string }).code;
      setErrorMsg(getErrorMessage(code));
      setIsSubmitting(false);
    }
  }

  // 가드 리다이렉트 처리 중
  if (!nickname) return null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900">안녕하세요, {nickname}님! 👋</h2>
        <p className="mt-1 text-sm text-gray-500">어떤 분이신가요?</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {TYPE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setSelected(opt.value)}
            className={cn(
              'flex flex-col items-center gap-3 rounded-xl border-2 px-4 py-6 text-center transition-colors',
              selected === opt.value
                ? 'border-[#4CAF82] bg-[#E8F5EE]'
                : 'border-[#E8E8E8] bg-[#F5F5F5] hover:border-[#4CAF82]/50',
            )}
            aria-pressed={selected === opt.value}
          >
            <span className="text-4xl" aria-hidden="true">
              {opt.emoji}
            </span>
            <span className="whitespace-pre-line text-sm font-medium leading-snug text-gray-800">
              {opt.label}
            </span>
            {selected === opt.value && (
              <svg
                className="h-5 w-5 text-[#4CAF82]"
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

      <p className="text-center text-sm text-gray-400">나중에 변경할 수 있어요 😊</p>

      {errorMsg && (
        <p role="alert" className="text-center text-sm text-red-500">
          {errorMsg}
        </p>
      )}

      <Button
        type="button"
        size="lg"
        className="w-full"
        disabled={!selected || isSubmitting}
        isLoading={isSubmitting}
        onClick={handleSubmit}
      >
        다음 →
      </Button>
    </div>
  );
}
