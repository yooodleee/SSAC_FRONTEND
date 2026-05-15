'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { toastStore } from '@/lib/toastStore';
import { mypageV1Service } from '@/services/mypageV1';
import type { MyPageResponse } from '@/services/mypageV1';

// UI-only type: 도메인 메타데이터 상수 — BE domainId 기준
const DOMAIN_LIST = [
  { id: 'realestate', emoji: '🏠', name: '부동산/자취' },
  { id: 'finance', emoji: '💰', name: '재테크/금융' },
  { id: 'tax', emoji: '📋', name: '세금/연말정산' },
  { id: 'scholarship', emoji: '🎓', name: '학자금/장학금' },
] as const;

const MIN_DOMAINS = 1;
const MAX_DOMAINS = 3;

interface InterestSectionProps {
  data: MyPageResponse;
}

export function InterestSection({ data }: InterestSectionProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(data.interests ?? []);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  function toggle(id: string) {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((d) => d !== id);
      }
      if (prev.length >= MAX_DOMAINS) {
        toastStore.show(`최대 ${MAX_DOMAINS}개까지 선택할 수 있어요`);
        return prev;
      }
      return [...prev, id];
    });
  }

  async function handleSave() {
    if (selectedIds.length < MIN_DOMAINS || saving) return;
    setSaving(true);
    setSaveError(null);
    try {
      await mypageV1Service.updateInterests(selectedIds);
      toastStore.show('관심 도메인이 저장됐어요 ✅');
    } catch {
      setSaveError('저장에 실패했어요. 잠시 후 다시 시도해주세요.');
    } finally {
      setSaving(false);
    }
  }

  const canSave = selectedIds.length >= MIN_DOMAINS;

  return (
    <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6">
      <h2 className="mb-1 text-base font-semibold text-[var(--color-text-primary)]">관심 도메인</h2>
      <p className="mb-4 text-xs text-[var(--color-text-secondary)]">
        {MIN_DOMAINS}~{MAX_DOMAINS}개 선택
      </p>

      <div className="mb-4 grid grid-cols-3 gap-3">
        {DOMAIN_LIST.map(({ id, emoji, name }) => {
          const selected = selectedIds.includes(id);
          const disabledAdd = !selected && selectedIds.length >= MAX_DOMAINS;

          return (
            <button
              key={id}
              type="button"
              onClick={() => toggle(id)}
              disabled={disabledAdd}
              aria-pressed={selected}
              className={cn(
                'flex flex-col items-center gap-1 rounded-xl border-2 p-3 text-center transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4CAF82] focus-visible:ring-offset-1',
                selected
                  ? 'border-[#4CAF82] bg-[#E8F5EE] dark:bg-[#4CAF82]/10'
                  : 'border-[var(--color-border)] bg-[var(--color-bg-page)] dark:bg-slate-800',
                disabledAdd && 'cursor-not-allowed opacity-50',
              )}
            >
              <span className="text-xl" aria-hidden="true">
                {selected ? '✅' : emoji}
              </span>
              <span className="text-xs font-medium text-[var(--color-text-primary)]">{name}</span>
            </button>
          );
        })}
      </div>

      {saveError && (
        <p role="alert" className="mb-3 text-sm text-[var(--color-danger)]">
          {saveError}
        </p>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={!canSave || saving}
          className={cn(
            'h-10 rounded-xl px-5 text-sm font-medium text-white transition-colors',
            'bg-[#4CAF82] hover:bg-[#388E60]',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4CAF82] focus-visible:ring-offset-1',
          )}
        >
          {saving ? '저장 중...' : '저장'}
        </button>
      </div>
    </section>
  );
}
