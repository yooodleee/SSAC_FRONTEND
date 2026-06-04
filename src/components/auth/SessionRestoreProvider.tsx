'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authStore } from '@/lib/authStore';
import type { components } from '@/api-contract/generated/api-types';

type ReissueResponse = components['schemas']['ReissueResponse'];

/**
 * 모듈 레벨 플래그 — React 리마운트에서도 초기화되지 않는다.
 *
 * 문제: RootLayout이 cookies()를 읽는 동적 Server Component이기 때문에
 * BFF가 cookieStore.set()으로 쿠키를 갱신하면 Server Component 트리가 재렌더된다.
 * 이 재렌더가 SessionRestoreProvider를 언마운트·리마운트하면서
 * useRef(인스턴스 수명)가 초기화되어 reissue가 반복 호출되는 무한 루프가 발생한다.
 *
 * 해결: 모듈 레벨 플래그(_attempted)는 리마운트 사이클을 넘어 유지되므로
 * 쿠키 갱신 → 재렌더 → 리마운트 상황에서 중복 호출을 차단한다.
 * 하드 리프레시 시 모듈이 재로드되어 자연스럽게 초기화된다.
 */
let _attempted = false;

/**
 * 앱 초기화 시 세션을 복원하는 Provider.
 *
 * - 새로고침 등으로 authStore(in-memory)가 초기화된 경우,
 *   refreshToken 쿠키를 이용해 POST /api/v1/auth/reissue를 호출한다.
 * - 성공: authStore에 사용자 정보 설정 (BFF가 accessToken 쿠키도 갱신)
 * - 실패 (쿠키 없음 / 만료): 비로그인 상태 유지
 * - 로그인 페이지에서 세션 복원 성공 시 /home으로 이동
 */
export function SessionRestoreProvider() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // 리마운트 포함 전체 세션에서 1회만 실행
    if (_attempted) return;
    _attempted = true;

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
