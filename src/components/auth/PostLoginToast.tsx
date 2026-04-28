'use client';

import { useState, useEffect } from 'react';

const TOAST_KEY = 'quizMergeNotice';

/**
 * 로그인 후 퀴즈 기록 병합 완료 안내 토스트.
 *
 * - 콜백 페이지가 sessionStorage에 'quizMergeNotice' 키를 설정하면 마운트 시 감지
 * - 5초 후 자동 닫힘, 또는 사용자가 직접 닫기 가능
 * - 루트 layout에 포함하여 모든 페이지에서 동작
 */
export function PostLoginToast() {
  const [visible, setVisible] = useState(false);

  // sessionStorage 플래그 감지 → 비동기로 setState (동기 호출 시 lint 경고 방지)
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    try {
      const flag = sessionStorage.getItem(TOAST_KEY);
      if (flag) {
        sessionStorage.removeItem(TOAST_KEY);
        timer = setTimeout(() => setVisible(true), 0);
      }
    } catch {
      // sessionStorage 사용 불가 환경
    }
    return () => clearTimeout(timer);
  }, []);

  // 토스트 노출 후 5초 뒤 자동 닫힘
  useEffect(() => {
    if (!visible) return undefined;
    const timer = setTimeout(() => setVisible(false), 5000);
    return () => clearTimeout(timer);
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 left-1/2 z-[300] -translate-x-1/2 flex items-center gap-3 rounded-xl bg-gray-900 px-5 py-3 text-sm text-white shadow-lg"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="h-4 w-4 flex-shrink-0 text-green-400"
      >
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      비회원 퀴즈 기록이 계정에 반영되었습니다.
      <button
        type="button"
        aria-label="닫기"
        onClick={() => setVisible(false)}
        className="ml-1 text-gray-400 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="h-4 w-4"
        >
          <path d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
