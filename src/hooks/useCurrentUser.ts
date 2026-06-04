'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { authStore } from '@/lib/authStore';

interface CurrentUser {
  nickname: string;
  level: string | null;
}

interface MyPageBffResponse {
  data?: {
    nickname?: string;
    level?: string | null;
  };
}

/**
 * 현재 로그인된 사용자의 닉네임과 레벨을 반환한다.
 * 1순위: authStore (SessionRestoreProvider 가 reissue 후 채움)
 * 2순위: BFF /api/v1/users/mypage 직접 조회 (apiClient 미경유 — 전역 handleClientError 트리거 방지)
 */
export function useCurrentUser(isLoggedIn: boolean) {
  const authUser = useSyncExternalStore(authStore.subscribe, authStore.getCurrent, () => null);

  const [fetchedUser, setFetchedUser] = useState<CurrentUser | null>(null);
  const [fetchDone, setFetchDone] = useState(false);

  useEffect(() => {
    if (!isLoggedIn || authUser?.nickname) return;

    fetch('/api/v1/users/mypage')
      .then((r) => (r.ok ? (r.json() as Promise<MyPageBffResponse>) : Promise.reject()))
      .then((res) => {
        if (res.data?.nickname) {
          setFetchedUser({
            nickname: res.data.nickname,
            level: res.data.level ?? null,
          });
        }
      })
      .catch(() => {})
      .finally(() => setFetchDone(true));
  }, [isLoggedIn, authUser]);

  if (authUser?.nickname) {
    return { nickname: authUser.nickname, level: authUser.level ?? null, isLoading: false };
  }

  return {
    nickname: fetchedUser?.nickname ?? null,
    level: fetchedUser?.level ?? null,
    isLoading: isLoggedIn && !fetchDone,
  };
}
