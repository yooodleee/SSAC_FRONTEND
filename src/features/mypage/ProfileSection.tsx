'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { toastStore } from '@/lib/toastStore';
import { mypageV1Service } from '@/services/mypageV1';
import type { MyPageResponse } from '@/services/mypageV1';

interface ProfileSectionProps {
  data: MyPageResponse;
  onNicknameUpdated: (nickname: string) => void;
}

export function ProfileSection({ data, onNicknameUpdated }: ProfileSectionProps) {
  const [editing, setEditing] = useState(false);
  const [nicknameInput, setNicknameInput] = useState(data.nickname ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nicknameError =
    nicknameInput.trim().length === 0
      ? '닉네임을 입력해주세요'
      : nicknameInput.trim().length > 20
        ? '닉네임은 20자 이하로 입력해주세요'
        : null;

  function startEditing() {
    setNicknameInput(data.nickname ?? '');
    setError(null);
    setEditing(true);
  }

  function cancelEditing() {
    setEditing(false);
    setError(null);
  }

  async function handleSave() {
    if (nicknameError || saving) return;
    setSaving(true);
    setError(null);
    try {
      await mypageV1Service.updateNickname(nicknameInput.trim());
      onNicknameUpdated(nicknameInput.trim());
      setEditing(false);
      toastStore.show('닉네임이 변경됐어요 🎉');
    } catch {
      setError('닉네임 변경에 실패했어요. 잠시 후 다시 시도해주세요.');
    } finally {
      setSaving(false);
    }
  }

  const providerLabel =
    data.provider === 'KAKAO'
      ? '카카오 로그인'
      : data.provider === 'NAVER'
        ? '네이버 로그인'
        : data.provider === 'GOOGLE'
          ? '구글 로그인'
          : '소셜 로그인';

  return (
    <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-3xl" aria-hidden="true">
            🌿
          </span>

          {editing ? (
            <div className="flex flex-col gap-1.5">
              <input
                type="text"
                value={nicknameInput}
                onChange={(e) => setNicknameInput(e.target.value)}
                maxLength={20}
                autoFocus
                aria-label="닉네임 입력"
                className={cn(
                  'w-40 rounded-lg border px-3 py-1.5 text-base font-bold text-[var(--color-text-primary)]',
                  'focus:outline-none focus:ring-2 focus:ring-[#4CAF82]',
                  nicknameError ? 'border-[var(--color-danger)]' : 'border-[var(--color-border)]',
                )}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') void handleSave();
                  if (e.key === 'Escape') cancelEditing();
                }}
              />
              {nicknameError && (
                <p role="alert" className="text-xs text-[var(--color-danger)]">
                  {nicknameError}
                </p>
              )}
              {error && (
                <p role="alert" className="text-xs text-[var(--color-danger)]">
                  {error}
                </p>
              )}
            </div>
          ) : (
            <p className="text-lg font-bold text-[var(--color-text-primary)]">
              {data.nickname ?? '닉네임 없음'}
            </p>
          )}

          <p className="text-sm text-[var(--color-text-secondary)]">
            {data.userTypeLabel ?? '사회초년생'} · {providerLabel}
          </p>
        </div>

        <div className="flex shrink-0 gap-2">
          {editing ? (
            <>
              <button
                type="button"
                onClick={cancelEditing}
                className="h-9 rounded-lg border border-[var(--color-border)] px-3 text-sm text-[var(--color-text-secondary)] transition-colors hover:bg-gray-100 dark:hover:bg-slate-700"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={!!nicknameError || saving}
                className={cn(
                  'h-9 rounded-lg px-4 text-sm font-medium text-white transition-colors',
                  'bg-[#4CAF82] hover:bg-[#388E60]',
                  'disabled:cursor-not-allowed disabled:opacity-50',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4CAF82] focus-visible:ring-offset-1',
                )}
              >
                {saving ? '저장 중...' : '저장'}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={startEditing}
              className={cn(
                'h-9 rounded-lg border border-[var(--color-border)] px-3 text-sm text-[var(--color-text-secondary)]',
                'transition-colors hover:bg-gray-100 dark:hover:bg-slate-700',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4CAF82] focus-visible:ring-offset-1',
              )}
            >
              닉네임 수정
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
