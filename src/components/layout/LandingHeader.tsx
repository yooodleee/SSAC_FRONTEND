'use client';

/**
 * LandingHeader — 전역 네비게이션 (두 행)
 *
 * Row 1 (h-14):
 *   [좌 50%] 싹 로고 + 검색창(중앙까지)
 *   [우 50%] 로그인 버튼 (우측 끝 고정)
 * Row 2 (md+ 전용):
 *   [부동산/자취] ... [시리즈] 8개 도메인 탭 (중앙 정렬)
 *
 * 적용 페이지: /, /home, /contents/*, /content/*, /search
 */

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { UserSidePanel } from './UserSidePanel';
import { DOMAIN_TABS } from '@/constants/domains';

interface LandingHeaderProps {
  isLoggedIn: boolean;
}

export function LandingHeader({ isLoggedIn }: LandingHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidePanelOpen, setSidePanelOpen] = useState(false);
  const pathname = usePathname();
  const { nickname } = useCurrentUser(isLoggedIn);

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-50 bg-black">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          {/* ── Row 1: 로고·검색 (좌 50%) + 인증 (우 50%) ── */}
          <div className="flex h-14 items-center">
            {/* 좌 절반: 로고 */}
            <div className="flex flex-1 items-center">
              <Link
                href="/"
                aria-label="SSAC 홈으로 이동"
                className="flex shrink-0 items-center gap-2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-1 focus-visible:ring-offset-black"
              >
                <Image
                  src="/gress.png"
                  alt="SSAC 마스코트"
                  width={28}
                  height={28}
                  className="h-7 w-7 object-contain"
                  priority
                />
                <span className="whitespace-nowrap text-base font-bold text-white">SSAC</span>
              </Link>
            </div>

            {/* 우 절반: 인증 버튼 (데스크톱) */}
            <div className="hidden flex-1 items-center justify-end gap-3 pl-3 md:flex">
              {isLoggedIn ? (
                <button
                  type="button"
                  aria-label="내 프로필 열기"
                  onClick={() => setSidePanelOpen(true)}
                  className="shrink-0 flex h-9 w-9 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className="h-5 w-5"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </button>
              ) : (
                <Link
                  href="/login"
                  className="shrink-0 rounded-full px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                >
                  로그인
                </Link>
              )}
            </div>

            {/* 모바일 햄버거 */}
            <button
              type="button"
              aria-label={mobileOpen ? '메뉴 닫기' : '메뉴 열기'}
              aria-expanded={mobileOpen}
              aria-controls="global-mobile-menu"
              onClick={() => setMobileOpen((v) => !v)}
              className="ml-auto flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 md:hidden"
            >
              {mobileOpen ? (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="h-5 w-5"
                >
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="h-5 w-5"
                >
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          {/* ── Row 2: 8개 도메인 탭 (md+ 전용) ── */}
          <nav aria-label="도메인 메뉴" className="hidden border-t border-white/10 md:block">
            <div className="flex items-center justify-center gap-1 py-1.5">
              {DOMAIN_TABS.map((tab) => {
                const isActive = pathname.startsWith(tab.route);
                return (
                  <Link
                    key={tab.key}
                    href={tab.route}
                    className={cn(
                      'relative whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide transition-colors',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400',
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'text-white/80 hover:bg-white/10 hover:text-white',
                    )}
                  >
                    {tab.emoji} {tab.label}
                    {isActive && (
                      <span
                        aria-hidden="true"
                        className="absolute bottom-0 left-1/2 h-0.5 w-4/5 -translate-x-1/2 rounded-full bg-white"
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>

        {/* ── 모바일 드로어 ── */}
        {mobileOpen && (
          <div
            id="global-mobile-menu"
            className="border-t border-white/10 bg-black px-4 py-4 md:hidden"
          >
            <nav className="flex flex-col gap-1">
              {DOMAIN_TABS.map((tab) => {
                const isActive = pathname.startsWith(tab.route);
                return (
                  <Link
                    key={tab.key}
                    href={tab.route}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'min-h-[48px] rounded-lg px-3 py-2.5 text-sm font-semibold tracking-wide',
                      isActive ? 'bg-[#E8F5EE]/20 text-[#4CAF82]' : 'text-white hover:bg-white/10',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400',
                    )}
                  >
                    {tab.emoji} {tab.label}
                  </Link>
                );
              })}
            </nav>

            <div className="my-3 border-t border-white/10" />

            {isLoggedIn ? (
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  setSidePanelOpen(true);
                }}
                className="flex min-h-[48px] w-full items-center gap-3 rounded-lg px-3 text-sm font-medium text-white hover:bg-white/10"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="h-5 w-5 shrink-0"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                {nickname ?? '...'}
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="flex min-h-[48px] items-center rounded-lg px-3 text-sm font-medium text-white hover:bg-white/10"
              >
                로그인
              </Link>
            )}
          </div>
        )}
      </header>
      {isLoggedIn && (
        <UserSidePanel
          isOpen={sidePanelOpen}
          onClose={() => setSidePanelOpen(false)}
          nickname={nickname ?? ''}
        />
      )}
    </>
  );
}
