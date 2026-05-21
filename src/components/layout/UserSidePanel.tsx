'use client';

/**
 * UserSidePanel — 로그인 사용자 사이드 패널
 *
 * - [Hi {닉네임}!] 버튼 클릭 시 우측에서 슬라이드 인
 * - 너비: 화면의 30% 또는 최대 400px
 * - 외부 클릭 / Escape 키로 닫기
 */

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface UserSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  nickname: string;
}

const PANEL_NAV_ITEMS = [
  { label: '나의 홈', href: '/home' },
  { label: '내가 본 콘텐츠', href: '/home/content-history' },
  { label: '계정', href: '/home/account-settings' },
] as const;

export function UserSidePanel({ isOpen, onClose, nickname }: UserSidePanelProps) {
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/v1/auth/status')
      .then((r) => r.json())
      .then((d: { data?: { role?: string } }) => setRole(d.data?.role ?? null))
      .catch(() => {});
  }, []);

  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleLogout = async () => {
    onClose();
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
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
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="사용자 메뉴"
        className={cn(
          'fixed inset-y-0 right-0 z-[210] flex w-[30%] min-w-[280px] max-w-[400px] flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out dark:bg-slate-900',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        {/* 패널 상단 */}
        <div className="flex min-h-[64px] items-center justify-between border-b border-[#E8E8E8] px-6 py-4 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <span className="text-[16px] font-medium text-[#1A1A1A] dark:text-slate-100">
              Hi {nickname}!
            </span>
            {role === 'ADMIN' && (
              <span className="rounded-full bg-[#1B4332] px-2 py-0.5 text-[10px] font-bold text-white tracking-wide">
                ADMIN
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="min-h-[40px] rounded-lg px-3 py-1.5 text-sm text-[#6B6B6B] transition-colors hover:bg-[#F5F5F5] hover:text-[#1A1A1A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4CAF82] dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            >
              로그아웃
            </button>
            {/* 닫기 버튼 */}
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
        </div>

        {/* 구분선 */}
        <div className="border-b border-[#E8E8E8] dark:border-slate-700" />

        {/* 탭 메뉴 */}
        <nav className="flex-1 px-3 py-4" aria-label="사용자 메뉴">
          <ul className="space-y-0.5">
            {PANEL_NAV_ITEMS.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className="flex min-h-[48px] items-center rounded-lg px-4 text-[15px] text-[#1A1A1A] transition-colors hover:bg-[#E8F5EE] hover:text-[#4CAF82] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4CAF82] dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            {role === 'ADMIN' && (
              <li>
                <Link
                  href="/admin"
                  onClick={onClose}
                  className="flex min-h-[48px] items-center rounded-lg px-4 text-[15px] text-[#1A1A1A] transition-colors hover:bg-[#E8F5EE] hover:text-[#4CAF82] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4CAF82] dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  관리자 홈
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </>,
    document.body,
  );
}
