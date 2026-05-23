'use client';

/**
 * Header — Client Component
 *
 * 렌더링 전략:
 * - Client Component (usePathname으로 경로 감지)
 * - '/' 경로(브랜딩 랜딩 홈)에서는 null 반환 → 랜딩 헤더는 page.tsx에서 직접 렌더링
 * - isLoggedIn은 layout.tsx에서 서버 쿠키 읽어 prop으로 전달
 */

import { usePathname } from 'next/navigation';
import { env } from '@/lib/env';
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
    pathname.startsWith('/onboarding')
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
    </header>
  );
}
