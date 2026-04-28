'use client';

import { useState, useCallback } from 'react';

const SESSION_KEY = 'loginPromptCount';
const MAX_PROMPTS = 3;

function getStoredCount(): number {
  try {
    return parseInt(sessionStorage.getItem(SESSION_KEY) ?? '0', 10);
  } catch {
    return 0;
  }
}

export interface UseLoginPromptReturn {
  isOpen: boolean;
  redirectTo: string | undefined;
  openPrompt: (options?: { redirectTo?: string }) => void;
  closePrompt: () => void;
  /** 세션 내 최대 노출(3회)에 도달했는지 여부 */
  canShow: boolean;
}

/**
 * 비회원 로그인 유도 모달 상태 관리 훅.
 *
 * - sessionStorage 기반으로 동일 세션 내 최대 3회까지만 모달 노출
 * - openPrompt 호출 시 카운터를 증가시킨 뒤 모달 오픈
 */
export function useLoginPrompt(): UseLoginPromptReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [redirectTo, setRedirectTo] = useState<string | undefined>(undefined);

  const canShow = typeof window !== 'undefined' ? getStoredCount() < MAX_PROMPTS : true;

  const openPrompt = useCallback((options?: { redirectTo?: string }) => {
    const count = getStoredCount();
    if (count >= MAX_PROMPTS) return;
    try {
      sessionStorage.setItem(SESSION_KEY, String(count + 1));
    } catch {
      // sessionStorage를 쓸 수 없는 환경에서는 카운트 없이 허용
    }
    setRedirectTo(options?.redirectTo);
    setIsOpen(true);
  }, []);

  const closePrompt = useCallback(() => {
    setIsOpen(false);
  }, []);

  return { isOpen, openPrompt, closePrompt, redirectTo, canShow };
}
