'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const ADMIN_NAV_ITEMS = [
  { label: '관리자 홈', href: '/admin' },
  { label: '피드백 관리', href: '/admin/feedbacks' },
  { label: '콘텐츠 관리', href: '/admin/contents' },
] as const;

export function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* 데스크탑: 좌측 사이드바 */}
      <aside className="hidden w-52 shrink-0 md:block">
        <nav aria-label="관리자 메뉴">
          <ul className="space-y-0.5">
            {ADMIN_NAV_ITEMS.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex min-h-[48px] items-center rounded-lg px-4 text-[15px] font-medium transition-colors',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4332]',
                      active
                        ? 'text-[#1A1A1A] underline decoration-[#1B4332] decoration-2 underline-offset-4'
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
        aria-label="관리자 하단 메뉴"
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#E8E8E8] bg-white md:hidden"
      >
        <ul className="flex">
          {ADMIN_NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <li key={item.label} className="flex-1">
                <Link
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex min-h-[56px] flex-col items-center justify-center gap-1 text-xs font-medium transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#1B4332]',
                    active
                      ? 'text-[#1A1A1A] underline decoration-[#1B4332] decoration-2 underline-offset-4'
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
