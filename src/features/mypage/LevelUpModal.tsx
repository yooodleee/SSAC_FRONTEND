'use client';

import { useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { levelUpStore, type LevelUpPayload } from '@/lib/levelUpStore';
import { cn } from '@/lib/utils';

function getSnapshot(): LevelUpPayload | null {
  return levelUpStore.getCurrent();
}

function getServerSnapshot(): null {
  return null;
}

export function LevelUpModal() {
  const payload = useSyncExternalStore(levelUpStore.subscribe, getSnapshot, getServerSnapshot);
  const router = useRouter();

  if (!payload) return null;

  function handleConfirm() {
    levelUpStore.dismiss();
    router.refresh();
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="levelup-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />

      <div className="relative w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl dark:bg-slate-800">
        {/* 레벨업 애니메이션 */}
        <div className="mb-4 flex items-center justify-center gap-3">
          <span className="text-4xl animate-bounce">{payload.previousLevelEmoji}</span>
          <span className="text-2xl text-[var(--color-text-secondary)]">→</span>
          <span className="text-4xl animate-bounce" style={{ animationDelay: '0.15s' }}>
            {payload.newLevelEmoji}
          </span>
        </div>

        <h3
          id="levelup-modal-title"
          className="mb-1 text-center text-xl font-bold text-[var(--color-text-primary)]"
        >
          레벨업했어요! 🎉
        </h3>
        <p className="mb-1 text-center text-base font-semibold text-[#4CAF82]">
          이제 {payload.newLevelLabel}예요!
        </p>
        <p className="mb-6 text-center text-sm text-[var(--color-text-secondary)]">
          더 깊은 금융 지식으로 나아가볼까요?
        </p>

        <button
          type="button"
          onClick={handleConfirm}
          className={cn(
            'w-full rounded-xl bg-[#4CAF82] py-3 text-sm font-medium text-white',
            'transition-colors hover:bg-[#388E60]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4CAF82] focus-visible:ring-offset-1',
          )}
        >
          확인
        </button>
      </div>
    </div>
  );
}
