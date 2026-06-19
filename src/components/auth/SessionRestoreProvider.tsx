'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authStore } from '@/lib/authStore';
import type { components } from '@/api-contract/generated/api-types';

type ReissueResponse = components['schemas']['ReissueResponse'];

/**
 * 모듈 레벨 플래그 — React 리마운트에서도 초기화되지 않는다.
 *
 * 왜 두 개로 분리했는가:
 * SessionRestoreProvider는 RootLayout에 있는 클라이언트 컴포넌트이므로
 * 클라이언트 사이드 네비게이션 중에는 마운트 해제되지 않는다.
 * 따라서 useEffect([])는 최초 마운트 시 딱 1회만 실행된다.
 *
 * 문제 시나리오:
 *   1. /home 로드 → _nonLoginAttempted = true, reissue 완료
 *   2. accessToken 만료 후 /home/account-settings 접근
 *   3. 서버가 /login?redirectTo=/home/account-settings 으로 리다이렉트
 *   4. 클라이언트가 /login으로 이동해도 SessionRestoreProvider는 살아있음
 *   5. [pathname] 의존성 덕분에 pathname이 /login으로 바뀌면 effect 재실행
 *   6. _loginAttempted = false → reissue 재실행 → redirectTo로 이동
 *
 * 리마운트 루프 방지:
 *   BFF가 cookieStore.set()으로 쿠키를 갱신하면 RootLayout(동적 Server Component)이
 *   재렌더되어 SessionRestoreProvider가 언마운트·리마운트될 수 있다.
 *   모듈 레벨 플래그는 리마운트 사이클을 넘어 유지되므로 중복 호출을 차단한다.
 *   하드 리프레시 시 모듈이 재로드되어 자연스럽게 초기화된다.
 */
let _nonLoginAttempted = false;
let _loginAttempted = false;

/**
 * 앱 초기화 및 pathname 변경 시 세션을 복원하는 Provider.
 *
 * - 비로그인 페이지: refreshToken 쿠키로 reissue를 시도해 authStore를 복원한다.
 * - 로그인 페이지: reissue 성공 시 redirectTo 파라미터 목적지(없으면 /home)로 이동한다.
 * - 실패 (쿠키 없음 / 만료): 비로그인 상태 유지
 */
export function SessionRestoreProvider() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === '/login') {
      // 로그인 페이지: reissue 후 원래 목적지로 이동
      // (accessToken 만료 후 /login으로 리다이렉트된 경우에도 처리)
      if (_loginAttempted) return;
      _loginAttempted = true;

      (async () => {
        try {
          const res = await fetch('/api/v1/auth/reissue', { method: 'POST' });
          if (!res.ok) return;

          const data = (await res.json()) as ReissueResponse;
          authStore.set(data);

          const redirectTo = new URLSearchParams(window.location.search).get('redirectTo');
          router.replace(redirectTo ?? '/home');
        } catch {
          // 네트워크 오류 → 비로그인 상태 유지
        }
      })();
    } else {
      // 비로그인 페이지: authStore가 비어있는 경우에만 조용히 복원
      if (_nonLoginAttempted) return;
      _nonLoginAttempted = true;

      if (authStore.getCurrent() !== null) return;

      // startup reissue 루프 방지:
      // BFF cookieStore.set() 이후 RSC 재렌더로 모듈이 재로드되면 _nonLoginAttempted가
      // 초기화되어 reissue가 반복 호출될 수 있다.
      // sessionStorage 타임스탬프로 10초 이내 중복 호출을 차단한다.
      const lastReissuedAt = sessionStorage.getItem('startup-reissued-at');
      if (lastReissuedAt && Date.now() - parseInt(lastReissuedAt, 10) < 10_000) return;

      (async () => {
        try {
          const res = await fetch('/api/v1/auth/reissue', { method: 'POST' });
          if (!res.ok) return;

          // 성공한 startup reissue 시각을 기록해 루프 차단
          // X-Reissued: true는 BE가 실제로 토큰을 재발급했음을 의미 (추가 확인 신호)
          sessionStorage.setItem('startup-reissued-at', String(Date.now()));

          const data = (await res.json()) as ReissueResponse;
          authStore.set(data);
        } catch {
          // 네트워크 오류 → 비로그인 상태 유지
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return null;
}
