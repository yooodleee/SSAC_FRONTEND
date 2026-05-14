import { Button } from '@/components/ui/Button';

interface SkipConfirmDialogProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export function SkipConfirmDialog({ onConfirm, onCancel }: SkipConfirmDialogProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="skip-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-[var(--color-bg-page)] p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="skip-dialog-title"
          className="mb-2 text-lg font-bold text-[var(--color-text-primary)]"
        >
          테스트를 건너뛸까요?
        </h2>
        <p className="mb-6 text-sm leading-relaxed text-[var(--color-text-secondary)]">
          건너뛰면 기본 레벨(씨앗)로 시작하게 됩니다.
          <br />
          나중에 마이페이지에서 다시 테스트할 수 있어요 😊
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" size="lg" className="flex-1" onClick={onCancel}>
            취소
          </Button>
          <Button size="lg" className="flex-1" onClick={onConfirm}>
            건너뛰기
          </Button>
        </div>
      </div>
    </div>
  );
}
