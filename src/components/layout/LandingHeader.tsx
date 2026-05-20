'use client';

/**
 * LandingHeader — 전역 네비게이션
 *
 * 구조 (단일 행):
 *   [싹 로고] [모든 콘텐츠][새로운 소식][TECH][FAQ] [🔍 검색어 입력] [로그인 하기 / Hi 닉네임!]
 *
 * 스타일:
 *   항상 bg-black / 텍스트 흰색 (스크롤 기반 전환 없음)
 *
 * 적용 페이지:
 *   / (브랜딩 랜딩 홈), /home (맞춤 홈 화면)
 */

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { UserSidePanel } from './UserSidePanel';

interface LandingHeaderProps {
  isLoggedIn: boolean;
}

const NAV_ITEMS = [
  { label: '모든 콘텐츠', href: '/content' },
  { label: '새로운 소식', href: '/news' },
  { label: 'TECH', href: '/#tech' },
  { label: 'FAQ', href: '/#faq' },
] as const;

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-4 w-4 flex-shrink-0 text-white/50"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  );
}

export function LandingHeader({ isLoggedIn }: LandingHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidePanelOpen, setSidePanelOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const router = useRouter();
  const { nickname } = useCurrentUser(isLoggedIn);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchValue.trim())}`);
    }
  };

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-50 bg-black">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          {/* relative flex: 로고 좌측 고정 / 메뉴 탭 절대 중앙 / 검색+인증 우측 */}
          <div className="relative flex h-16 items-center">
            {/* 싹 로고 (좌측) */}
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

            {/* 메뉴 탭 — FAQ 오른쪽 끝이 화면 중앙에 오도록 (right-1/2) */}
            <nav
              aria-label="전역 메뉴"
              className="absolute right-1/2 hidden items-center gap-3 pr-3 md:flex"
            >
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full px-4 py-2 text-sm font-semibold tracking-wide text-white/85 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* 검색창 + 인증 버튼 — 중앙(left-1/2)부터 우측 끝까지 */}
            <div className="absolute left-1/2 right-0 hidden items-center gap-3 pl-3 md:flex">
              {/* 검색창 — 남은 공간 채움 */}
              <form onSubmit={handleSearch} className="flex-1">
                <label htmlFor="global-search" className="sr-only">
                  검색어 입력
                </label>
                <div className="relative flex w-full items-center">
                  <span className="pointer-events-none absolute left-3">
                    <SearchIcon />
                  </span>
                  <input
                    id="global-search"
                    type="search"
                    placeholder="검색어 입력"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className="w-full rounded-full bg-white/10 py-2.5 pl-9 pr-4 text-sm text-white placeholder-white/50 outline-none transition-colors focus:bg-white/20"
                  />
                </div>
              </form>

              {/* 인증 버튼 */}
              {isLoggedIn ? (
                <button
                  type="button"
                  onClick={() => setSidePanelOpen(true)}
                  className="shrink-0 rounded-full px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                >
                  Hi {nickname ?? '...'}!
                </button>
              ) : (
                <Link
                  href="/login"
                  className="flex shrink-0 items-center rounded-full px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                >
                  로그인 하기
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
        </div>

        {/* 모바일 드로어 */}
        {mobileOpen && (
          <div
            id="global-mobile-menu"
            className="border-t border-white/10 bg-black px-4 py-4 md:hidden"
          >
            {/* 검색 (모바일) */}
            <form onSubmit={handleSearch} className="mb-4">
              <label htmlFor="global-search-mobile" className="sr-only">
                검색어 입력
              </label>
              <div className="relative flex items-center">
                <span className="pointer-events-none absolute left-3">
                  <SearchIcon />
                </span>
                <input
                  id="global-search-mobile"
                  type="search"
                  placeholder="검색어 입력"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="w-full rounded-full bg-white/10 py-2.5 pl-9 pr-4 text-sm text-white placeholder-white/50 outline-none"
                />
              </div>
            </form>

            {/* 메뉴 */}
            <nav className={cn('flex flex-col gap-1')}>
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="min-h-[48px] rounded-lg px-3 py-2.5 text-sm font-semibold tracking-wide text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="my-3 border-t border-white/10" />

            {/* 인증 영역 */}
            {isLoggedIn ? (
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  setSidePanelOpen(true);
                }}
                className="flex min-h-[48px] w-full items-center rounded-lg px-3 text-sm font-medium text-white hover:bg-white/10"
              >
                Hi {nickname ?? '...'}!
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="flex min-h-[48px] items-center rounded-lg px-3 text-sm font-medium text-white hover:bg-white/10"
              >
                로그인 하기
              </Link>
            )}
          </div>
        )}
      </header>

      {/* 사이드 패널 (로그인 상태) */}
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
