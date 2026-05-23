'use client';

import { usePathname } from 'next/navigation';

export function Footer() {
  const pathname = usePathname();

  // 로그인 / 회원가입 / 온보딩 페이지는 전용 레이아웃 사용 — 푸터 숨김
  if (pathname === '/login' || pathname.startsWith('/signup') || pathname.startsWith('/onboarding'))
    return null;

  return (
    <footer className="border-t border-gray-200 bg-gray-50 dark:border-slate-700 dark:bg-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <p className="text-center text-sm text-gray-500 dark:text-slate-500">
          &copy; {new Date().getFullYear()} SSAC Frontend. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
