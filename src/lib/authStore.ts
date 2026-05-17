// ============================================================
// 인증된 사용자 컨텍스트 상태 관리 (pub/sub 패턴)
// 앱 초기화 시 reissue 성공 후 set()을 호출한다.
// ============================================================

import type { components } from '@/api-contract/generated/api-types';

export type UserContext = components['schemas']['ReissueResponse'];

type Listener = (user: UserContext | null) => void;

let current: UserContext | null = null;
const listeners = new Set<Listener>();

function emit(): void {
  const snapshot = current;
  listeners.forEach((l) => l(snapshot));
}

export const authStore = {
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  set(user: UserContext): void {
    current = user;
    emit();
  },

  clear(): void {
    current = null;
    emit();
  },

  getCurrent(): UserContext | null {
    return current;
  },
};
