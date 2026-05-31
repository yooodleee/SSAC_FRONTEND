'use client';

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authStore } from '@/lib/authStore';
import type { components } from '@/api-contract/generated/api-types';

type ReissueResponse = components['schemas']['ReissueResponse'];

/**
 * 앱 초기화 시 세션을 복원하는 Provider.
 *
 * - 새로고침 등으로 authStore(in-memory)가 초기화된 경우,
 *   refreshToken 쿠키를 이용해 POST /api/v1/auth/reissue를 호출한다.
 * - 성공: authStore에 사용자 정보 설정 (BFF가 accessToken 쿠키도 갱신)
 * - 실패 (쿠키 없음 / 만료): 비로그인 상태 유지
 * - 로그인 페이지에서 세션 복원 성공 시 /home으로 이동
 *
 * [StrictMode 주의]
 * calledRef로 이중 호출을 방지한다. (useAutoLogin과 동일한 패턴)
 */
export function SessionRestoreProvider() {
  const router = useRouter();
  const pathname = usePathname();
  const calledRef = useRef(false);

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;

    if (authStore.getCurrent() !== null) return;

    (async () => {
      try {
        const res = await fetch('/api/v1/auth/reissue', { method: 'POST' });
        if (!res.ok) return;

        const data = (await res.json()) as ReissueResponse;
        authStore.set(data);

        // 로그인 페이지에서 세션이 복원된 경우 홈으로 이동
        if (pathname === '/login') {
          router.replace('/home');
        }
      } catch {
        // 네트워크 오류 → 비로그인 상태 유지
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
