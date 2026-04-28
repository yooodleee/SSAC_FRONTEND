'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { usePathname } from 'next/navigation';
import { env } from '@/lib/env';

interface LoginPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** 로그인 완료 후 이동할 경로. 미지정 시 현재 경로 사용 */
  redirectTo?: string;
}

/**
 * 비회원이 로그인이 필요한 기능을 시도할 때 표시하는 모달.
 *
 * - 카카오 / 네이버 로그인 버튼 포함
 * - Escape 키 또는 닫기 버튼으로 이전 화면 복귀 (모달 닫기)
 * - createPortal로 document.body에 렌더링하여 z-index 충돌 방지
 */
export function LoginPromptModal({ isOpen, onClose, redirectTo }: LoginPromptModalProps) {
  const pathname = usePathname();

  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const redirect = redirectTo ?? pathname;

  // 모달 열림 시 스크롤 잠금
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Escape 키로 닫기
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const handleKakaoLogin = () => {
    sessionStorage.setItem('kakaoRedirectTo', redirect);
    const kakaoUrl = new URL('/oauth2/authorization/kakao', env.backendUrl);
    kakaoUrl.searchParams.set('redirectTo', redirect);
    window.location.href = kakaoUrl.toString();
  };

  const handleNaverLogin = () => {
    sessionStorage.setItem('naverRedirectTo', redirect);
    window.location.href = `${env.backendUrl}/api/v1/auth/naver/login`;
  };

  if (!mounted || !isOpen) return null;

  return createPortal(
    <>
      {/* 백드롭 */}
      <div aria-hidden="true" className="fixed inset-0 z-[200] bg-black/50" onClick={onClose} />

      {/* 모달 패널 */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="로그인 필요"
        className="fixed left-1/2 top-1/2 z-[210] w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-xl"
      >
        {/* 닫기 버튼 */}
        <button
          type="button"
          aria-label="닫기"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="h-5 w-5"
          >
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* 자물쇠 아이콘 */}
        <div className="mb-4 flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="h-6 w-6 text-blue-600"
            >
              <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </div>

        <h2 className="mb-2 text-center text-lg font-bold text-gray-900">로그인이 필요합니다</h2>
        <p className="mb-6 text-center text-sm text-gray-500">
          이 기능을 사용하려면 로그인이 필요합니다.
        </p>

        <div className="flex flex-col gap-3">
          {/* 카카오 로그인 */}
          <button
            type="button"
            onClick={handleKakaoLogin}
            aria-label="카카오로 로그인"
            className="flex h-[45px] w-full items-center justify-center gap-[6px] rounded-xl bg-[#FEE500] text-[15px] font-medium text-[#000000D9] transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FEE500] focus-visible:ring-offset-2"
          >
            <KakaoSymbol />
            카카오로 로그인
          </button>

          {/* 네이버 로그인 */}
          <button
            type="button"
            onClick={handleNaverLogin}
            aria-label="네이버로 로그인"
            className="flex h-[45px] w-full items-center justify-center gap-[6px] rounded-xl bg-[#03C75A] text-[15px] font-medium text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#03C75A] focus-visible:ring-offset-2"
          >
            <NaverSymbol />
            네이버로 로그인
          </button>
        </div>
      </div>
    </>,
    document.body,
  );
}

function KakaoSymbol() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9 1.5C4.85786 1.5 1.5 4.21634 1.5 7.57143C1.5 9.65169 2.74364 11.4989 4.66071 12.6027L3.80357 15.8036C3.73036 16.0714 4.03393 16.2857 4.26786 16.1339L8.08036 13.6875C8.38393 13.7143 8.6875 13.7143 9 13.7143C13.1421 13.7143 16.5 11 16.5 7.57143C16.5 4.21634 13.1421 1.5 9 1.5Z"
        fill="#1A1A1A"
      />
    </svg>
  );
}

function NaverSymbol() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M10.18 9.31L7.62 5.4H5.4V12.6H7.82V8.69L10.38 12.6H12.6V5.4H10.18V9.31Z"
        fill="white"
      />
    </svg>
  );
}
