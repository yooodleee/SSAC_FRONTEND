'use client';

/**
 * LandingHeader — 브랜딩 랜딩 홈 전용 헤더
 *
 * 구조:
 *   상단 행: [🌱 SSAC] [검색창] [Login/Join]
 *   하단 행: [CONTENTS][NEWS][TECH][FAQ]  (데스크탑)
 *   모바일: 1행 구조 + 햄버거 메뉴 → 드로어
 *
 * 스크롤 기반 색상 전환:
 *   첫 번째 섹션 구간 (scrollY < 90vh): bg-black / 텍스트 흰색
 *   두 번째 섹션 이후  (scrollY >= 90vh): bg-white / 텍스트 검은색
 *   transition: 300ms ease
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface LandingHeaderProps {
  isLoggedIn: boolean;
}

const NAV_ITEMS = [
  { label: 'CONTENTS', href: '/content' },
  { label: 'NEWS', href: '/news' },
  { label: 'TECH', href: '/#tech' },
  { label: 'FAQ', href: '/#faq' },
] as const;

export function LandingHeader({ isLoggedIn }: LandingHeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY >= window.innerHeight * 0.9);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchValue.trim())}`);
    }
  };

  const textClass = cn(
    'transition-colors duration-300 ease-in-out',
    scrolled ? 'text-gray-900' : 'text-white',
  );

  const hoverBg = scrolled ? 'hover:bg-gray-100' : 'hover:bg-white/10';

  return (
    <header
      className={cn(
        'fixed left-0 right-0 top-0 z-50 transition-colors duration-300 ease-in-out',
        scrolled ? 'bg-white shadow-sm' : 'bg-black',
      )}
    >
      {/* ── 상단 행 ───────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex h-14 items-center justify-between gap-3">
          {/* 로고 */}
          <Link
            href="/"
            aria-label="SSAC 홈으로 이동"
            className="flex shrink-0 items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-1"
          >
            <Image
              src="/gress.png"
              alt="SSAC 마스코트"
              width={28}
              height={28}
              className="h-7 w-7 object-contain"
              priority
            />
            <span className={cn('whitespace-nowrap text-base font-bold', textClass)}>SSAC</span>
          </Link>

          {/* 검색창 (데스크탑 md 이상) */}
          <form onSubmit={handleSearch} className="hidden flex-1 max-w-sm md:block">
            <label htmlFor="landing-search" className="sr-only">
              금융 지식 검색
            </label>
            <input
              id="landing-search"
              type="search"
              placeholder="금융 지식 검색..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className={cn(
                'w-full rounded-full px-4 py-2 text-sm outline-none transition-colors duration-300',
                scrolled
                  ? 'bg-gray-100 text-gray-900 placeholder-gray-400 focus:bg-gray-200'
                  : 'bg-white/10 text-white placeholder-white/50 focus:bg-white/20',
              )}
            />
          </form>

          {/* 인증 버튼 (데스크탑) */}
          <div className="hidden items-center gap-2 md:flex">
            {isLoggedIn ? (
              <Link
                href="/home"
                className={cn(
                  'min-h-[48px] rounded-md px-4 py-2 text-sm font-medium transition-colors duration-300',
                  textClass,
                  hoverBg,
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400',
                )}
              >
                홈으로
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className={cn(
                    'min-h-[48px] rounded-md px-4 py-2 text-sm font-medium transition-colors duration-300',
                    textClass,
                    hoverBg,
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400',
                  )}
                >
                  Login
                </Link>
                <Link
                  href="/login"
                  className="min-h-[48px] rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                >
                  Join
                </Link>
              </>
            )}
          </div>

          {/* 모바일 햄버거 */}
          <button
            type="button"
            aria-label={mobileOpen ? '메뉴 닫기' : '메뉴 열기'}
            aria-expanded={mobileOpen}
            aria-controls="landing-mobile-menu"
            onClick={() => setMobileOpen((v) => !v)}
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-md transition-colors duration-300 md:hidden',
              textClass,
              hoverBg,
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400',
            )}
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

      {/* ── 하단 행 — 메인 메뉴 (데스크탑) ──────────────────────────────── */}
      <div
        className={cn(
          'hidden border-t transition-colors duration-300 ease-in-out md:block',
          scrolled ? 'border-gray-100' : 'border-white/10',
        )}
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <nav aria-label="랜딩 메인 메뉴" className="flex h-10 items-center justify-center gap-10">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'text-sm font-semibold tracking-wider transition-colors duration-300',
                  scrolled ? 'text-gray-700 hover:text-gray-900' : 'text-white/85 hover:text-white',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400',
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* ── 모바일 드로어 ────────────────────────────────────────────────── */}
      {mobileOpen && (
        <div
          id="landing-mobile-menu"
          className={cn(
            'border-t px-4 py-4 transition-colors duration-300 md:hidden',
            scrolled ? 'border-gray-100 bg-white' : 'border-white/10 bg-black',
          )}
        >
          {/* 검색 (모바일) */}
          <form onSubmit={handleSearch} className="mb-4">
            <label htmlFor="landing-search-mobile" className="sr-only">
              금융 지식 검색
            </label>
            <input
              id="landing-search-mobile"
              type="search"
              placeholder="금융 지식 검색..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className={cn(
                'w-full rounded-full px-4 py-2.5 text-sm outline-none transition-colors',
                scrolled
                  ? 'bg-gray-100 text-gray-900 placeholder-gray-400'
                  : 'bg-white/10 text-white placeholder-white/50',
              )}
            />
          </form>

          {/* 메인 메뉴 */}
          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'min-h-[48px] rounded-lg px-3 py-2.5 text-sm font-semibold tracking-wider',
                  scrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/10',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400',
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className={cn('my-3 border-t', scrolled ? 'border-gray-100' : 'border-white/10')} />

          {/* 인증 영역 */}
          {isLoggedIn ? (
            <Link
              href="/home"
              onClick={() => setMobileOpen(false)}
              className={cn(
                'block min-h-[48px] rounded-lg px-3 py-2.5 text-sm font-medium',
                scrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/10',
              )}
            >
              홈으로
            </Link>
          ) : (
            <div className="flex gap-2">
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex-1 rounded-lg px-3 py-2.5 text-center text-sm font-medium',
                  'min-h-[48px]',
                  scrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/10',
                )}
              >
                Login
              </Link>
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="flex-1 min-h-[48px] rounded-lg bg-blue-600 px-3 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-700"
              >
                Join
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
