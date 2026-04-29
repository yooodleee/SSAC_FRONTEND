'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { NAV_ITEMS, SEGMENT_NAV_ITEMS } from '@/lib/navigation';
import { useNavData } from '@/hooks/useNavData';
import { NotificationDropdown } from '@/components/notification/NotificationDropdown';
import type { NavItem } from '@/lib/navigation';

// ── Inline SVG helpers ────────────────────────────────────────────────────────

function NavIcon({ path }: { path: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-4 w-4 flex-shrink-0"
    >
      <path d={path} />
    </svg>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn(
        'h-3 w-3 flex-shrink-0 transition-transform duration-150',
        open && 'rotate-180',
      )}
    >
      <path d="M19 9l-7 7-7-7" />
    </svg>
  );
}

// ── NavLink — 드롭다운 없는 단순 링크 ───────────────────────────────────────

function NavLink({
  item,
  active,
  badge,
}: {
  item: NavItem;
  active: boolean;
  badge?: React.ReactNode;
}) {
  return (
    <Link
      href={item.href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'relative flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1',
        active ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
      )}
    >
      <NavIcon path={item.iconPath} />
      {item.label}
      {badge}
    </Link>
  );
}

// ── DropdownItem — 드롭다운 트리거 ──────────────────────────────────────────

interface DropdownItemProps {
  item: NavItem;
  active: boolean;
  isOpen: boolean;
  onOpen: (href: string) => void;
  onScheduleClose: () => void;
  onCancelClose: () => void;
  onContainerBlur: (e: React.FocusEvent<HTMLDivElement>, href: string) => void;
  onTriggerKey: (e: React.KeyboardEvent<HTMLButtonElement>, item: NavItem) => void;
  onItemKey: (e: React.KeyboardEvent<HTMLAnchorElement>, parentHref: string) => void;
  triggerRefs: React.MutableRefObject<Map<string, HTMLButtonElement>>;
  pathname: string;
  onClose: () => void;
}

function DropdownItem({
  item,
  active,
  isOpen,
  onOpen,
  onScheduleClose,
  onCancelClose,
  onContainerBlur,
  onTriggerKey,
  onItemKey,
  triggerRefs,
  pathname,
  onClose,
}: DropdownItemProps) {
  return (
    <div
      className="relative"
      onMouseEnter={() => onOpen(item.href)}
      onMouseLeave={onScheduleClose}
      onFocus={onCancelClose}
      onBlur={(e) => onContainerBlur(e, item.href)}
    >
      <button
        ref={(el) => {
          if (el) triggerRefs.current.set(item.href, el);
          else triggerRefs.current.delete(item.href);
        }}
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="true"
        onKeyDown={(e) => onTriggerKey(e, item)}
        className={cn(
          'flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1',
          active || isOpen
            ? 'bg-blue-50 text-blue-700'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
        )}
      >
        <NavIcon path={item.iconPath} />
        {item.label}
        <Chevron open={isOpen} />
      </button>

      {isOpen && (
        <ul
          id={dropdownId(item.href)}
          className="absolute left-0 top-full z-50 mt-1.5 w-60 overflow-hidden rounded-xl border border-gray-200 bg-white py-1.5 shadow-lg"
        >
          {item.children!.map((child) => {
            const childActive = pathname === child.href;
            return (
              <li key={child.href}>
                <Link
                  href={child.href}
                  aria-current={childActive ? 'page' : undefined}
                  onKeyDown={(e) => onItemKey(e, item.href)}
                  onClick={onClose}
                  className={cn(
                    'block px-4 py-2.5 transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500',
                    childActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900',
                  )}
                >
                  <span className="block text-sm font-medium">{child.label}</span>
                  <span className="mt-0.5 block text-xs text-gray-500">{child.description}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// ── NotificationBell ─────────────────────────────────────────────────────────

function NotificationBell({
  loading,
  error,
  unreadCount,
  notifications,
  onMarkRead,
  onMarkAllRead,
}: {
  loading: boolean;
  error: boolean;
  unreadCount: number | null;
  notifications:
    | import('@/api-contract/generated/api-types').components['schemas']['NotificationItemResponse'][]
    | null;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}) {
  const [open, setOpen] = useState(false);
  const hasUnread = !loading && unreadCount !== null && unreadCount > 0;

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={hasUnread ? `읽지 않은 알림 ${unreadCount}개` : '알림'}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-8 w-8 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
      >
        {/* 벨 아이콘 */}
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
          <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {/* 뱃지 — 로딩 중에는 영역만 유지, 데이터 확인 후 표시 */}
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[1rem] items-center justify-center">
          {hasUnread && (
            <span className="flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
              {unreadCount! > 99 ? '99+' : unreadCount}
            </span>
          )}
        </span>
      </button>

      {open && (
        <NotificationDropdown
          loading={loading}
          error={error}
          notifications={notifications}
          onMarkRead={(id) => {
            onMarkRead(id);
          }}
          onMarkAllRead={() => {
            onMarkAllRead();
          }}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}

// ── DesktopNav ───────────────────────────────────────────────────────────────

export function DesktopNav({ isLoggedIn }: { isLoggedIn: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const [openItem, setOpenItem] = useState<string | null>(null);
  const triggerRefs = useRef(new Map<string, HTMLButtonElement>());
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    unreadCount,
    notificationsLoading,
    notificationsError,
    notifications,
    markRead,
    markAllRead,
    resumeItem,
    resumeLoading,
    segment,
    segmentLoading,
  } = useNavData(isLoggedIn);

  const isActive = useCallback(
    (href: string): boolean => {
      if (href === '/') return pathname === '/';
      return pathname === href || pathname.startsWith(href + '/');
    },
    [pathname],
  );

  const openMenu = (href: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenItem(href);
  };

  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => setOpenItem(null), 120);
  };

  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };

  const onContainerBlur = (e: React.FocusEvent<HTMLDivElement>, href: string) => {
    const relatedTarget = e.relatedTarget;
    if (!(relatedTarget instanceof Node) || !e.currentTarget.contains(relatedTarget)) {
      if (openItem === href) setOpenItem(null);
    }
  };

  const onTriggerKey = (e: React.KeyboardEvent<HTMLButtonElement>, item: NavItem) => {
    if (!item.children) return;
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        setOpenItem((prev) => (prev === item.href ? null : item.href));
        break;
      case 'ArrowDown':
        e.preventDefault();
        setOpenItem(item.href);
        requestAnimationFrame(() => {
          const dropdown = document.getElementById(dropdownId(item.href));
          dropdown?.querySelector<HTMLElement>('a')?.focus();
        });
        break;
      case 'Escape':
        setOpenItem(null);
        break;
    }
  };

  const onItemKey = (e: React.KeyboardEvent<HTMLAnchorElement>, parentHref: string) => {
    const dropdown = document.getElementById(dropdownId(parentHref));
    const links = dropdown ? Array.from(dropdown.querySelectorAll<HTMLElement>('a')) : [];
    const idx = links.indexOf(e.currentTarget);

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        setOpenItem(null);
        triggerRefs.current.get(parentHref)?.focus();
        break;
      case 'ArrowDown': {
        e.preventDefault();
        const next = links[idx + 1];
        if (next) next.focus();
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        if (idx === 0) {
          triggerRefs.current.get(parentHref)?.focus();
        } else {
          const prev = links[idx - 1];
          if (prev) prev.focus();
        }
        break;
      }
      case 'Home': {
        e.preventDefault();
        const first = links[0];
        if (first) first.focus();
        break;
      }
      case 'End': {
        e.preventDefault();
        const last = links[links.length - 1];
        if (last) last.focus();
        break;
      }
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  };

  // 모든 메뉴 항목 표시 (requiresAuth 항목은 잠금 상태로 표시)
  const visibleItems = NAV_ITEMS;

  // 세그먼트 메뉴: 로딩 완료 후 세그먼트가 있을 때만 표시 (로딩 중에는 기본 메뉴만 표시)
  const segmentItems =
    !segmentLoading && segment
      ? ((SEGMENT_NAV_ITEMS as Record<string, readonly NavItem[] | undefined>)[segment] ?? [])
      : [];

  const dropdownProps = {
    onOpen: openMenu,
    onScheduleClose: scheduleClose,
    onCancelClose: cancelClose,
    onContainerBlur,
    onTriggerKey,
    onItemKey,
    triggerRefs,
    pathname,
    onClose: () => setOpenItem(null),
  };

  return (
    <nav aria-label="주요 메뉴" className="hidden items-center gap-0.5 md:flex">
      {/* 기본 메뉴 */}
      {visibleItems.map((item) => {
        const active = isActive(item.href);
        const isOpen = openItem === item.href;
        const locked = !!(item.requiresAuth && !isLoggedIn);

        // 비로그인 상태의 인증 필요 항목: 잠금 스타일로 로그인 페이지로 연결
        if (locked) {
          return (
            <Link
              key={item.href}
              href={`/login?redirectTo=${encodeURIComponent(item.href)}`}
              title="로그인이 필요한 기능입니다"
              className={cn(
                'flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1',
                'text-gray-400 hover:bg-gray-50 hover:text-gray-500',
              )}
            >
              <NavIcon path={item.iconPath} />
              {item.label}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="h-3 w-3 text-gray-300"
              >
                <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </Link>
          );
        }

        if (!item.children) {
          return <NavLink key={item.href} item={item} active={active} />;
        }

        return (
          <DropdownItem
            key={item.href}
            item={item}
            active={active}
            isOpen={isOpen}
            {...dropdownProps}
          />
        );
      })}

      {/* 세그먼트 메뉴 (로딩 후 표시) */}
      {segmentItems.map((item) => (
        <NavLink key={item.href} item={item} active={isActive(item.href)} />
      ))}

      {/* 구분선 */}
      <div aria-hidden="true" className="mx-1.5 h-5 border-l border-gray-200" />

      {/* 인증 영역 */}
      {isLoggedIn ? (
        <>
          {/* 알림 */}
          <NotificationBell
            loading={notificationsLoading}
            error={notificationsError}
            unreadCount={unreadCount}
            notifications={notifications}
            onMarkRead={markRead}
            onMarkAllRead={markAllRead}
          />

          {/* 이어 보기 — 로딩 완료 후, 항목이 있을 때만 노출 */}
          {!resumeLoading && resumeItem && resumeItem.lastPosition && (
            <Link
              href={resumeItem.lastPosition}
              title={resumeItem.title ?? '이어 보기'}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1',
              )}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="h-4 w-4 flex-shrink-0"
              >
                <path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              이어 보기
            </Link>
          )}

          {/* 프로필 링크 */}
          <Link
            href="/my/profile"
            aria-current={pathname === '/my/profile' ? 'page' : undefined}
            className={cn(
              'flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1',
              pathname.startsWith('/my')
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
            )}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="h-4 w-4 flex-shrink-0"
            >
              <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            내 정보
          </Link>

          {/* 로그아웃 */}
          <button
            type="button"
            onClick={() => void handleLogout()}
            className={cn(
              'flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1',
            )}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="h-4 w-4 flex-shrink-0"
            >
              <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            로그아웃
          </button>
        </>
      ) : (
        <>
          {/* 개인화 기능 영역 로그인 유도 CTA (이어 보기, 학습 기록) */}
          <Link
            href="/login"
            title="로그인하면 이어 보기와 학습 기록을 사용할 수 있습니다"
            className={cn(
              'flex items-center gap-1 rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600 transition-colors',
              'hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1',
            )}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="h-3 w-3"
            >
              <path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            이어 보기
          </Link>
          <Link
            href="/login"
            className={cn(
              'flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1',
              pathname === '/login'
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
            )}
          >
            로그인
          </Link>
          <Link
            href="/login"
            className={cn(
              'rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors',
              'hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1',
            )}
          >
            회원가입
          </Link>
        </>
      )}
    </nav>
  );
}

function dropdownId(href: string): string {
  return `nav-dropdown-${href.replaceAll('/', '') || 'home'}`;
}
