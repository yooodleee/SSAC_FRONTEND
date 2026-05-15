// ============================================================
// 레벨업 모달 상태 관리 (pub/sub 패턴)
// 콘텐츠 완료 또는 퀴즈 제출 후 isLevelUp: true 수신 시 show()를 호출한다.
// sessionStorage 기반으로 동일 세션 내 중복 표시를 방지한다.
// ============================================================

const SESSION_KEY = 'levelUpShown';

export interface LevelUpPayload {
  previousLevel: string;
  previousLevelEmoji: string;
  newLevel: string;
  newLevelEmoji: string;
  newLevelLabel: string;
}

type Listener = (payload: LevelUpPayload | null) => void;

let current: LevelUpPayload | null = null;
const listeners = new Set<Listener>();

function emit(): void {
  const snapshot = current;
  listeners.forEach((l) => l(snapshot));
}

export const levelUpStore = {
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  /**
   * 레벨업 모달을 표시한다.
   * 동일 세션에서 이미 표시된 경우 중복 표시하지 않는다.
   */
  show(payload: LevelUpPayload): void {
    if (typeof window === 'undefined') return;
    if (sessionStorage.getItem(SESSION_KEY)) return;
    current = payload;
    emit();
  },

  dismiss(): void {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(SESSION_KEY, '1');
    }
    current = null;
    emit();
  },

  getCurrent(): LevelUpPayload | null {
    return current;
  },
};
