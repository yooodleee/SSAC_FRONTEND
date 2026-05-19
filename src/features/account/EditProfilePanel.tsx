'use client';

/**
 * EditProfilePanel — 개인 정보 수정 우측 슬라이드 패널
 *
 * 너비: 화면의 35% 또는 최대 480px
 * 방향: 우측에서 좌측으로 슬라이드 인 (300ms ease)
 */

import { useState, useEffect, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { mypageV1Service } from '@/services/mypageV1';
import type { components } from '@/api-contract/generated/api-types';

type MyPageResponse = components['schemas']['MyPageResponse'];
type UpdateProfileRequest = components['schemas']['UpdateProfileRequest'];

// BE가 수신하는 값은 영문 enum, 표시 라벨만 한국어
const GENDER_OPTIONS = [
  { value: '', label: '선택 안 함' },
  { value: 'MALE', label: '남성' },
  { value: 'FEMALE', label: '여성' },
  { value: 'OTHER', label: '기타' },
];

/** 한글 → 영문 enum 마이그레이션 (기존 저장값 대응) */
const GENDER_KO_TO_ENUM: Record<string, string> = {
  남성: 'MALE',
  여성: 'FEMALE',
  기타: 'OTHER',
};

/** 숫자만 남기고 010-XXXX-XXXX 형식으로 자동 포맷 */
function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

/** 숫자만 남기고 YYYY-MM-DD 형식으로 자동 포맷 */
function formatBirthDate(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 4) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;
}

interface EditProfilePanelProps {
  isOpen: boolean;
  onClose: () => void;
  profile: MyPageResponse;
  onSaveSuccess: (updated: MyPageResponse) => void;
}

export function EditProfilePanel({
  isOpen,
  onClose,
  profile,
  onSaveSuccess,
}: EditProfilePanelProps) {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  // key prop으로 profile 변경 시 컴포넌트가 리마운트되므로 초기 상태가 항상 최신값
  const rawGender = profile.gender ?? '';
  const [form, setForm] = useState<UpdateProfileRequest>({
    name: profile.name ?? '',
    birthDate: formatBirthDate(profile.birthDate ?? ''),
    phone: formatPhone(profile.phone ?? ''),
    gender: GENDER_KO_TO_ENUM[rawGender] ?? rawGender,
    email: profile.email ?? '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Escape 닫기
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  // body 스크롤 잠금
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleChange = (field: keyof UpdateProfileRequest, value: string) => {
    let formatted = value;
    if (field === 'phone') formatted = formatPhone(value);
    if (field === 'birthDate') formatted = formatBirthDate(value);
    setForm((prev) => ({ ...prev, [field]: formatted }));
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);
    // 빈 문자열 필드는 BE에 전송하지 않음 (gender: '' 등 validation 오류 방지)
    const payload: UpdateProfileRequest = Object.fromEntries(
      Object.entries(form).filter(([, v]) => v !== ''),
    ) as UpdateProfileRequest;
    try {
      await mypageV1Service.updateProfile(payload);
      onSaveSuccess({ ...profile, ...payload });
    } catch (err) {
      const apiErr = err as { message?: string };
      setErrorMsg(apiErr.message ?? '저장 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setErrorMsg(null);
    onClose();
  };

  if (!mounted) return null;

  return createPortal(
    <>
      {/* 백드롭 */}
      <div
        aria-hidden="true"
        className={cn(
          'fixed inset-0 z-[200] bg-black/40 transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onClose}
      />

      {/* 패널 */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="개인 정보 수정"
        className={cn(
          'fixed inset-y-0 right-0 z-[210] flex w-[35%] min-w-[300px] max-w-[480px] flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out dark:bg-slate-900',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        {/* 패널 헤더 */}
        <div className="flex items-center justify-between border-b border-[#E8E8E8] px-6 py-4 dark:border-slate-700">
          <h2 className="text-[16px] font-semibold text-[#1A1A1A] dark:text-slate-100">
            개인 정보 수정
          </h2>
          <button
            type="button"
            aria-label="패널 닫기"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[#6B6B6B] transition-colors hover:bg-[#F5F5F5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4CAF82] dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="h-4 w-4"
            >
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 폼 영역 */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-4">
            {/* 이름 */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="edit-name"
                className="text-sm font-medium text-[#1A1A1A] dark:text-slate-200"
              >
                이름
              </label>
              <input
                id="edit-name"
                type="text"
                value={form.name ?? ''}
                onChange={(e) => handleChange('name', e.target.value)}
                className="h-11 rounded-lg border border-[#E8E8E8] px-3 text-sm text-[#1A1A1A] outline-none transition-colors focus:border-[#4CAF82] focus:ring-2 focus:ring-[#4CAF82]/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>

            {/* 생년월일 */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="edit-birthdate"
                className="text-sm font-medium text-[#1A1A1A] dark:text-slate-200"
              >
                생년월일
              </label>
              <input
                id="edit-birthdate"
                type="text"
                inputMode="numeric"
                placeholder="YYYY-MM-DD"
                value={form.birthDate ?? ''}
                onChange={(e) => handleChange('birthDate', e.target.value)}
                className="h-11 rounded-lg border border-[#E8E8E8] px-3 text-sm text-[#1A1A1A] outline-none transition-colors focus:border-[#4CAF82] focus:ring-2 focus:ring-[#4CAF82]/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>

            {/* 휴대폰 */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="edit-phone"
                className="text-sm font-medium text-[#1A1A1A] dark:text-slate-200"
              >
                휴대폰
              </label>
              <input
                id="edit-phone"
                type="tel"
                inputMode="numeric"
                placeholder="010-0000-0000"
                value={form.phone ?? ''}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="h-11 rounded-lg border border-[#E8E8E8] px-3 text-sm text-[#1A1A1A] outline-none transition-colors focus:border-[#4CAF82] focus:ring-2 focus:ring-[#4CAF82]/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>

            {/* 성별 */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="edit-gender"
                className="text-sm font-medium text-[#1A1A1A] dark:text-slate-200"
              >
                성별
              </label>
              <select
                id="edit-gender"
                value={form.gender ?? ''}
                onChange={(e) => handleChange('gender', e.target.value)}
                className="h-11 rounded-lg border border-[#E8E8E8] px-3 text-sm text-[#1A1A1A] outline-none transition-colors focus:border-[#4CAF82] focus:ring-2 focus:ring-[#4CAF82]/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              >
                {GENDER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 이메일 */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="edit-email"
                className="text-sm font-medium text-[#1A1A1A] dark:text-slate-200"
              >
                이메일
              </label>
              <input
                id="edit-email"
                type="email"
                value={form.email ?? ''}
                onChange={(e) => handleChange('email', e.target.value)}
                className="h-11 rounded-lg border border-[#E8E8E8] px-3 text-sm text-[#1A1A1A] outline-none transition-colors focus:border-[#4CAF82] focus:ring-2 focus:ring-[#4CAF82]/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>

            {/* 에러 메시지 */}
            {errorMsg && (
              <p role="alert" className="text-sm text-[#FF6B6B]">
                {errorMsg}
              </p>
            )}
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="flex gap-3 border-t border-[#E8E8E8] px-6 py-4 dark:border-slate-700">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
            className={cn(
              'flex-1 rounded-xl border border-[#E8E8E8] py-3 text-sm font-medium text-[#6B6B6B] transition-colors',
              'hover:bg-[#F5F5F5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4CAF82]',
              'disabled:opacity-60 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-800',
            )}
          >
            취소
          </button>
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={isSubmitting}
            className={cn(
              'flex-1 rounded-xl bg-[#4CAF82] py-3 text-sm font-medium text-white transition-colors',
              'hover:bg-[#388E60] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4CAF82] focus-visible:ring-offset-2',
              'disabled:cursor-not-allowed disabled:opacity-60',
            )}
          >
            {isSubmitting ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </>,
    document.body,
  );
}
