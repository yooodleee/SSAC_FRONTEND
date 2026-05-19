'use client';

/**
 * AccountSettings — /account-settings/ 클라이언트 컴포넌트
 *
 * 탭:
 *   1. 프로필 세부 정보 (기본 활성)
 *   2. 기본 설정
 */

import { useEffect, useState } from 'react';
import { mypageV1Service } from '@/services/mypageV1';
import type { components } from '@/api-contract/generated/api-types';
import { cn } from '@/lib/utils';
import { EditProfilePanel } from './EditProfilePanel';

type MyPageResponse = components['schemas']['MyPageResponse'];

// UI-only type: not derived from API contract
type TabId = 'profile' | 'preferences';

const GENDER_DISPLAY: Record<string, string> = {
  MALE: '남성',
  FEMALE: '여성',
  OTHER: '기타',
};

const TABS: { id: TabId; label: string }[] = [
  { id: 'profile', label: '프로필 세부 정보' },
  { id: 'preferences', label: '기본 설정' },
];

function ProfileCard({ profile, onEdit }: { profile: MyPageResponse; onEdit: () => void }) {
  const rows = [
    { label: '이름', value: profile.name ?? '—' },
    { label: '생년월일', value: profile.birthDate ?? '—' },
    { label: '휴대폰', value: profile.phone ?? '—' },
    {
      label: '성별',
      value: profile.gender ? (GENDER_DISPLAY[profile.gender] ?? profile.gender) : '—',
    },
    { label: '이메일', value: profile.email ?? '—' },
  ];

  return (
    <div className="relative rounded-2xl border border-[#E8E8E8] bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      {/* 개인 정보 수정 버튼 */}
      <button
        type="button"
        onClick={onEdit}
        className={cn(
          'absolute right-6 top-6 flex items-center gap-1.5 rounded-lg border border-[#E8E8E8] px-3 py-1.5 text-sm font-medium text-[#6B6B6B] transition-colors',
          'hover:border-[#4CAF82] hover:text-[#4CAF82] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4CAF82]',
          'dark:border-slate-600 dark:text-slate-400 dark:hover:border-[#4CAF82] dark:hover:text-[#4CAF82]',
        )}
      >
        {/* 연필 아이콘 (SVG) */}
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
          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
        개인 정보 수정
      </button>

      {/* 프로필 정보 */}
      <dl className="mt-8 space-y-4">
        {rows.map(({ label, value }) => (
          <div key={label} className="flex items-center gap-4">
            <dt className="w-24 shrink-0 text-[13px] text-[#6B6B6B] dark:text-slate-400">
              {label}
            </dt>
            <dd className="text-[15px] text-[#1A1A1A] dark:text-slate-100">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function ProfileCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-[#E8E8E8] bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="mt-8 space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="h-4 w-20 rounded bg-gray-200 dark:bg-slate-600" />
            <div className="h-4 w-40 rounded bg-gray-100 dark:bg-slate-700" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function AccountSettings() {
  const [activeTab, setActiveTab] = useState<TabId>('profile');
  const [profile, setProfile] = useState<MyPageResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editPanelOpen, setEditPanelOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    mypageV1Service
      .getMyPage()
      .then((res) => {
        if (res.data) setProfile(res.data);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const handleSaveSuccess = (updated: MyPageResponse) => {
    setProfile((prev) => ({ ...prev, ...updated }));
    setSuccessMsg('개인 정보가 성공적으로 수정되었습니다.');
    setEditPanelOpen(false);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      {/* 페이지 제목 */}
      <div className="mb-6 flex justify-end">
        <h1
          className="font-bold text-[#1A1A1A] dark:text-slate-100"
          style={{ fontSize: '28px', lineHeight: 1.3 }}
        >
          계정 관리
        </h1>
      </div>

      {/* 탭 */}
      <div className="mb-6 flex gap-1 border-b border-[#E8E8E8] dark:border-slate-700">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            aria-current={activeTab === tab.id ? 'page' : undefined}
            className={cn(
              'min-h-[48px] border-b-2 px-5 text-[15px] font-medium transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#4CAF82]',
              activeTab === tab.id
                ? 'border-[#4CAF82] text-[#4CAF82]'
                : 'border-transparent text-[#6B6B6B] hover:text-[#1A1A1A] dark:text-slate-400 dark:hover:text-slate-100',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 성공 메시지 */}
      {successMsg && (
        <div
          role="status"
          className="mb-4 rounded-lg bg-[#E8F5EE] px-4 py-3 text-sm text-[#4CAF82]"
        >
          {successMsg}
        </div>
      )}

      {/* 탭 콘텐츠 */}
      {activeTab === 'profile' && (
        <div>
          {isLoading ? (
            <ProfileCardSkeleton />
          ) : profile ? (
            <ProfileCard profile={profile} onEdit={() => setEditPanelOpen(true)} />
          ) : (
            <p className="text-center text-[13px] text-[#6B6B6B]">
              프로필 정보를 불러올 수 없습니다.
            </p>
          )}
        </div>
      )}

      {activeTab === 'preferences' && (
        <div className="rounded-2xl border border-[#E8E8E8] bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <h2 className="mb-2 text-[18px] font-semibold text-[#1A1A1A] dark:text-slate-100">
            기본 설정
          </h2>
          <p className="text-[13px] text-[#6B6B6B] dark:text-slate-400">추후 세부 기능 추가 예정</p>
        </div>
      )}

      {/* 개인 정보 수정 패널 — profile 변경 시 key로 리마운트하여 폼 초기화 */}
      {profile && (
        <EditProfilePanel
          key={`${profile.name ?? ''}|${profile.birthDate ?? ''}|${profile.phone ?? ''}|${profile.gender ?? ''}|${profile.email ?? ''}`}
          isOpen={editPanelOpen}
          onClose={() => setEditPanelOpen(false)}
          profile={profile}
          onSaveSuccess={handleSaveSuccess}
        />
      )}
    </div>
  );
}
