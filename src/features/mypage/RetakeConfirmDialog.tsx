import { cn } from '@/lib/utils';

interface RetakeConfirmDialogProps {
  open: boolean;
  isLoading: boolean;
  error: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function RetakeConfirmDialog({
  open,
  isLoading,
  error,
  onConfirm,
  onCancel,
}: RetakeConfirmDialogProps) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="retake-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* 오버레이 */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* 다이얼로그 */}
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-800">
        <h3
          id="retake-dialog-title"
          className="mb-2 text-center text-base font-bold text-[var(--color-text-primary)]"
        >
          레벨 테스트를 다시 할까요?
        </h3>
        <p className="mb-1 text-center text-sm text-[var(--color-text-secondary)]">
          현재 레벨이 초기화되고
        </p>
        <p className="mb-1 text-center text-sm text-[var(--color-text-secondary)]">
          테스트를 처음부터 진행하게 됩니다.
        </p>
        <p className="mb-5 text-center text-sm text-[var(--color-text-secondary)]">
          학습 기록은 유지됩니다 😊
        </p>

        {error && (
          <p role="alert" className="mb-3 text-center text-sm text-[var(--color-danger)]">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className={cn(
              'flex-1 rounded-xl border border-[var(--color-border)] py-3 text-sm font-medium',
              'text-[var(--color-text-secondary)] transition-colors hover:bg-gray-100 dark:hover:bg-slate-700',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-1',
            )}
          >
            취소
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={cn(
              'flex-1 rounded-xl bg-[#4CAF82] py-3 text-sm font-medium text-white',
              'transition-colors hover:bg-[#388E60]',
              'disabled:cursor-not-allowed disabled:opacity-60',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4CAF82] focus-visible:ring-offset-1',
            )}
          >
            {isLoading ? '처리 중...' : '다시 하기'}
          </button>
        </div>
      </div>
    </div>
  );
}
