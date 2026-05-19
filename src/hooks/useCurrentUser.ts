'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { authStore } from '@/lib/authStore';
import { mypageV1Service } from '@/services/mypageV1';

interface CurrentUser {
  nickname: string;
  level: string | null;
}

/**
 * 현재 로그인된 사용자의 닉네임과 레벨을 반환한다.
 * 1순위: authStore (auto-login 후 채워짐)
 * 2순위: /api/v1/users/mypage API 조회
 */
export function useCurrentUser(isLoggedIn: boolean) {
  const authUser = useSyncExternalStore(authStore.subscribe, authStore.getCurrent, () => null);

  const [fetchedUser, setFetchedUser] = useState<CurrentUser | null>(null);
  const [fetchDone, setFetchDone] = useState(false);

  useEffect(() => {
    if (!isLoggedIn || authUser?.nickname) return;

    mypageV1Service
      .getMyPage()
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
