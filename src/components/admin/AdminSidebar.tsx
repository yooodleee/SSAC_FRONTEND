'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const ADMIN_NAV_ITEMS = [
  {
    label: '관리자 홈',
    href: '/admin',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="h-4 w-4 shrink-0"
      >
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    label: '피드백 관리',
    href: '/admin/feedbacks',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="h-4 w-4 shrink-0"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
] as const;

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-56 flex-col border-r border-[#E8E8E8] bg-white">
      {/* 로고 영역 */}
      <div className="flex h-16 items-center px-5 border-b border-[#E8E8E8]">
        <span className="text-base font-bold text-[#1B4332]">SSAC 관리자</span>
      </div>

      {/* 네비게이션 */}
      <nav className="flex-1 px-3 py-4" aria-label="관리자 메뉴">
        <ul className="space-y-0.5">
          {ADMIN_NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex min-h-[44px] items-center gap-3 rounded-lg px-3 text-[14px] transition-colors',
                    isActive
                      ? 'bg-[#E8F5EE] font-semibold text-[#1B4332]'
                      : 'text-[#6B6B6B] hover:bg-[#F5F5F5] hover:text-[#1A1A1A]',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4332]',
                  )}
                >
                  {item.icon}
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
