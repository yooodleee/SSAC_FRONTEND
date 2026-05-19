'use client';

/**
 * SideTabMenu — /home, /account-settings 공통 좌측 탭 메뉴
 *
 * 데스크탑: 좌측 고정 사이드바
 * 모바일: 하단 네비게이션 바
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const TAB_ITEMS = [
  { label: '나의 홈', href: '/home' },
  { label: '내가 본 콘텐츠', href: '/home/content-history' },
  { label: '계정', href: '/home/account-settings' },
] as const;

export function SideTabMenu() {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href || pathname === href.replace(/\/$/, '');

  return (
    <>
      {/* 데스크탑: 좌측 사이드바 */}
      <aside className="hidden w-52 shrink-0 md:block">
        <nav aria-label="페이지 메뉴">
          <ul className="space-y-0.5">
            {TAB_ITEMS.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex min-h-[48px] items-center rounded-lg px-4 text-[15px] font-medium transition-colors',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4CAF82]',
                      active
                        ? 'text-[#1A1A1A] underline decoration-[#4CAF82] decoration-2 underline-offset-4'
                        : 'text-[#6B6B6B] hover:bg-[#F5F5F5] hover:text-[#1A1A1A]',
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* 모바일: 하단 네비게이션 바 */}
      <nav
        aria-label="하단 페이지 메뉴"
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#E8E8E8] bg-white md:hidden dark:border-slate-700 dark:bg-slate-900"
      >
        <ul className="flex">
          {TAB_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <li key={item.label} className="flex-1">
                <Link
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex min-h-[56px] flex-col items-center justify-center gap-1 text-xs font-medium transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#4CAF82]',
                    active
                      ? 'text-[#1A1A1A] underline decoration-[#4CAF82] decoration-2 underline-offset-4'
                      : 'text-[#6B6B6B]',
                  )}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
