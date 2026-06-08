'use client';

/**
 * Header — Client Component
 *
 * 렌더링 전략:
 * - Client Component (usePathname으로 경로 감지)
 * - '/' 경로(브랜딩 랜딩 홈)에서는 null 반환 → 랜딩 헤더는 page.tsx에서 직접 렌더링
 * - isLoggedIn은 layout.tsx에서 서버 쿠키 읽어 prop으로 전달
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { env } from '@/lib/env';
import { DOMAIN_TABS } from '@/constants/domains';
import { DesktopNav } from './DesktopNav';
import { MobileMenu } from './MobileMenu';
import { NavBranding } from './NavBranding';

export function Header({ isLoggedIn }: { isLoggedIn: boolean }) {
  const pathname = usePathname();

  // 브랜딩 랜딩 홈 / 로그인 / 맞춤 홈 페이지는 자체 헤더 사용
  if (
    pathname === '/' ||
    pathname === '/login' ||
    pathname.startsWith('/signup') ||
    pathname === '/home' ||
    pathname.startsWith('/home/') ||
    pathname.startsWith('/onboarding') ||
    pathname.startsWith('/contents') ||
    pathname.startsWith('/content/')
  )
    return null;

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/90">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* 브랜딩 — 마스코트 이미지 + 서비스명 */}
        <NavBranding />

        {/* 데스크톱 네비게이션 (md 이상) */}
        <DesktopNav isLoggedIn={isLoggedIn} />

        {/* 모바일 햄버거 메뉴 (md 미만) */}
        <MobileMenu appName={env.appName} isLoggedIn={isLoggedIn} />
      </div>

      {/* 도메인 탭 (md+ 전용) */}
      <nav
        aria-label="도메인 메뉴"
        className="hidden border-t border-gray-100 dark:border-slate-700/60 md:block"
      >
        <div className="mx-auto flex max-w-6xl items-center justify-center gap-1 px-4 py-1.5 sm:px-6">
          {DOMAIN_TABS.map((tab) => {
            const isActive = pathname.startsWith(tab.route);
            return (
              <Link
                key={tab.key}
                href={tab.route}
                className={cn(
                  'relative whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold tracking-wide transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
                  isActive
                    ? 'bg-gray-100 text-gray-900 dark:bg-slate-700 dark:text-slate-100'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100',
                )}
              >
                {tab.emoji} {tab.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute bottom-0 left-1/2 h-0.5 w-4/5 -translate-x-1/2 rounded-full bg-blue-500"
                  />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
