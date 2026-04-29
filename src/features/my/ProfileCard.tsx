'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils';
import type { UserProfile } from '@/types';

// ── 유효성 검사 ───────────────────────────────────────────────────────────────

function validate(value: string): string | null {
  if (!value.trim()) return '닉네임을 입력해주세요.';
  if (value.length < 2 || value.length > 20) return '닉네임인 20자 이하로 입력해주세요.';
  if (!/^[a-zA-Z0-9가-힣_-]+$/.test(value)) return '특수 문자는 사용할 수 없습니다.';
  return null;
}

// ── API 에러 메시지 매핑 ──────────────────────────────────────────────────────

const API_ERROR: Record<number, string> = {
  409: '이미 사용 중인 닉네임입니다.',
  400: '사용할 수 없는 닉네임입니다.',
};

function apiErrorMessage(status: number): string {
  return API_ERROR[status] ?? '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
}

// ── ProfileCard ───────────────────────────────────────────────────────────────

interface ProfileCardProps {
  profile: UserProfile;
}

export default function ProfileCard({ profile: initialProfile }: ProfileCardProps) {
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [editing, setEditing] = useState(false);
  const [nickname, setNickname] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const validationError = editing ? validate(nickname) : null;
  const isDisabled = !!validationError || isSubmitting;
  const initials = profile.nickname.slice(0, 2);

  const handleEditStart = () => {
    setNickname(profile.nickname);
    setApiError(null);
    setSuccessMessage(null);
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    setNickname('');
    setApiError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDisabled) return;

    setIsSubmitting(true);
    setApiError(null);

    try {
      const res = await fetch('/api/v1/users/me/nickname', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname }),
      });

      if (res.status === 401) {
        router.push('/login?error=SESSION_EXPIRED');
        return;
      }
      if (res.status === 403) {
        router.push('/forbidden');
        return;
      }

      if (!res.ok) {
        setApiError(apiErrorMessage(res.status));
        return;
      }

      const data = (await res.json()) as { data?: UserProfile };
      const updated = data.data ?? { ...profile, nickname };

      setProfile(updated);
      setEditing(false);
      setNickname('');
      setSuccessMessage('닉네임이 성공적으로 변경되었습니다.');
      router.refresh();
    } catch {
      setApiError(apiErrorMessage(0));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white px-8 py-8 shadow-sm">
      {/* 프로필 정보 */}
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        <div
          className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white"
          aria-hidden="true"
        >
          {initials}
        </div>

        <div className="flex-1 text-center sm:text-left">
          {editing ? (
            <p className="text-xl font-bold text-gray-900">{profile.nickname}</p>
          ) : (
            <h2 className="text-xl font-bold text-gray-900">{profile.nickname}</h2>
          )}
          <p className="mt-1 text-sm text-gray-500">{profile.email}</p>
          <p className="mt-3 text-xs text-gray-400">가입일 {formatDate(profile.createdAt)}</p>
        </div>

        {/* 수정 버튼 (편집 중에는 숨김) */}
        {!editing && (
          <button
            type="button"
            onClick={handleEditStart}
            className={cn(
              'shrink-0 rounded-full border border-gray-200 px-4 py-1.5 text-sm font-medium text-gray-600 transition-colors',
              'hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1',
            )}
          >
            닉네임 수정
          </button>
        )}
      </div>

      {/* 성공 메시지 */}
      {successMessage && !editing && (
        <p role="status" className="text-center text-sm text-green-600 sm:text-left">
          {successMessage}
        </p>
      )}

      {/* 닉네임 수정 폼 */}
      {editing && (
        <form onSubmit={(e) => void handleSubmit(e)} noValidate className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="nickname-input" className="text-sm font-medium text-gray-700">
              새 닉네임
            </label>
            <input
              id="nickname-input"
              type="text"
              value={nickname}
              onChange={(e) => {
                setNickname(e.target.value);
                if (apiError) setApiError(null);
              }}
              maxLength={20}
              autoComplete="off"
              autoFocus
              aria-describedby={validationError ? 'nickname-error' : undefined}
              aria-invalid={!!validationError}
              className={cn(
                'rounded-lg border px-4 py-2.5 text-sm text-gray-900 outline-none transition-colors',
                'placeholder:text-gray-400',
                'focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
                validationError
                  ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-gray-300 bg-white',
              )}
              placeholder="닉네임을 입력해주세요"
            />

            {/* 유효성 에러 */}
            {validationError && (
              <p id="nickname-error" role="alert" className="text-xs text-red-500">
                {validationError}
              </p>
            )}

            {/* API 에러 */}
            {apiError && !validationError && (
              <p role="alert" className="text-xs text-red-500">
                {apiError}
              </p>
            )}
          </div>

          {/* 버튼 영역 */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className={cn(
                'rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors',
                'hover:bg-gray-50 hover:text-gray-900',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-1',
                'disabled:cursor-not-allowed disabled:opacity-50',
              )}
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isDisabled}
              aria-disabled={isDisabled}
              className={cn(
                'rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors',
                'hover:bg-blue-700',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1',
                'disabled:cursor-not-allowed disabled:opacity-50',
              )}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-1.5">
                  <span
                    aria-hidden="true"
                    className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white"
                  />
                  저장 중…
                </span>
              ) : (
                '수정 확인'
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
