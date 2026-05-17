'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { components } from '@/api-contract/generated/api-types';
import { authStore } from '@/lib/authStore';

type ReissueResponse = components['schemas']['ReissueResponse'];

/**
 * 앱 진입점(/)에서 refreshToken 쿠키로 자동 로그인을 시도한다.
 *
 * - 성공 + onboardingCompleted: true  → /home
 * - 성공 + onboardingCompleted: false → /onboarding/test
 * - 실패 (401 / 네트워크 오류)         → /login
 *
 * [StrictMode 주의]
 * AbortController + calledRef 조합은 StrictMode에서 충돌한다.
 * - cleanup(abort) → remount가 동기적으로 실행되어 second effect에서 calledRef=true → 조기 종료
 * - 이후 AbortError가 비동기로 도착하면 calledRef 리셋이 이미 늦음 → fetch 재시도 불가
 * 해결: AbortController를 제거하고 calledRef만 사용해 이중 호출을 방지한다.
 */
export function useAutoLogin() {
  const router = useRouter();
  const calledRef = useRef(false);

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;

    (async () => {
      try {
        const res = await fetch('/api/v1/auth/reissue', { method: 'POST' });

        if (!res.ok) {
          router.replace('/login');
          return;
        }

        const data = (await res.json()) as ReissueResponse;
        authStore.set(data);

        if (data.onboardingCompleted) {
          router.replace('/home');
        } else {
          router.replace('/onboarding/test');
        }
      } catch {
        router.replace('/login');
      }
    })();
    // cleanup 없음: AbortController 제거로 StrictMode 이중 실행 방지
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
