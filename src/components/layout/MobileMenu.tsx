'use client';

import { useState, useEffect, useRef, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { NAV_ITEMS, SEGMENT_NAV_ITEMS } from '@/lib/navigation';
import type { NavItem } from '@/lib/navigation';
import { useNavData } from '@/hooks/useNavData';
import type { components } from '@/api-contract/generated/api-types';

type NotificationItemResponse = components['schemas']['NotificationItemResponse'];

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleString('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ── Inline SVG helpers ──────────────────────────────────────────────────────

function HamburgerIcon() {
  return (
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
  );
}

function CloseIcon() {
  return (
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
  );
}

function ChevronRight({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn('h-4 w-4 transition-transform duration-200', open && 'rotate-90')}
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

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
      className="h-5 w-5 flex-shrink-0"
    >
      <path d={path} />
    </svg>
  );
}

// ── MobileMenu ───────────────────────────────────────────────────────────────

export function MobileMenu({ appName, isLoggedIn }: { appName: string; isLoggedIn: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const [notifOpen, setNotifOpen] = useState(false);

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

  const drawerRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // 라우트 변경 시 메뉴 닫기
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setIsOpen(false);
    setExpanded(null);
  }

  // 메뉴 열릴 때 body 스크롤 잠금 + 포커스 이동
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      drawerRef.current?.querySelector<HTMLElement>('a, button')?.focus();
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Escape 키로 메뉴 닫기
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen]);

  const isActive = (href: string): boolean => {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(href + '/');
  };

  const toggleExpanded = (href: string) => {
    setExpanded((prev) => (prev === href ? null : href));
  };

  const handleLogout = async () => {
    setIsOpen(false);
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  };

  const handleMarkAllRead = () => {
    markAllRead();
    setNotifOpen(false);
  };

  // 모든 메뉴 항목 표시 (requiresAuth 항목은 잠금 상태로 표시)
  const visibleItems = NAV_ITEMS;

  // 세그먼트 메뉴: 로딩 완료 후, 세그먼트가 있을 때만 표시
  const segmentItems =
    !segmentLoading && segment
      ? ((SEGMENT_NAV_ITEMS as Record<string, readonly NavItem[] | undefined>)[segment] ?? [])
      : [];

  const hasUnread = !notificationsLoading && unreadCount !== null && unreadCount > 0;

  return (
    <div className="md:hidden">
      {/* 햄버거 토글 버튼 (알림 뱃지 포함) */}
      <div className="relative flex items-center gap-1">
        {/* 모바일 알림 뱃지 — 메뉴 버튼 위에 표시 */}
        {isLoggedIn && hasUnread && (
          <span className="absolute -right-1 -top-1 z-10 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
            {unreadCount! > 99 ? '99+' : unreadCount}
          </span>
        )}
        <button
          ref={toggleRef}
          type="button"
          aria-label={isOpen ? '메뉴 닫기' : '메뉴 열기'}
          aria-expanded={isOpen}
          aria-controls="mobile-nav-drawer"
          onClick={() => setIsOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
        >
          {isOpen ? <CloseIcon /> : <HamburgerIcon />}
        </button>
      </div>

      {/* createPortal을 사용하여 헤더의 CSS 제약(backdrop-blur)에서 탈출합니다. */}
      {mounted &&
        createPortal(
          <div className="md:hidden">
            {/* 백드롭 */}
            {isOpen && (
              <div
                aria-hidden="true"
                className="fixed inset-0 z-[100] bg-black/40"
                onClick={() => setIsOpen(false)}
              />
            )}

            {/* 드로어 패널 */}
            <div
              id="mobile-nav-drawer"
              ref={drawerRef}
              role="dialog"
              aria-modal="true"
              aria-label="메뉴"
              className={cn(
                'fixed inset-y-0 right-0 z-[110] flex w-72 flex-col bg-white transition-all duration-300',
                isOpen ? 'translate-x-0 shadow-2xl' : 'translate-x-full shadow-none',
              )}
            >
              {/* 드로어 헤더 */}
              <div className="flex h-16 items-center justify-between border-b border-gray-200 px-5">
                <span className="text-base font-bold text-gray-900">{appName}</span>
                <button
                  type="button"
                  aria-label="메뉴 닫기"
                  onClick={() => setIsOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
                >
                  <CloseIcon />
                </button>
              </div>

              {/* 메뉴 아이템 */}
              <nav aria-label="모바일 메뉴" className="flex-1 overflow-y-auto px-3 py-4">
                <ul className="space-y-1">
                  {/* 이어 보기 — 로그인 상태별 처리 */}
                  {isLoggedIn ? (
                    !resumeLoading &&
                    resumeItem &&
                    resumeItem.lastPosition && (
                      <li>
                        <Link
                          href={resumeItem.lastPosition}
                          className={cn(
                            'flex items-center gap-3 rounded-lg bg-blue-50 px-3 py-2.5 text-sm font-medium text-blue-700 transition-colors',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1',
                            'hover:bg-blue-100',
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
                            className="h-5 w-5 flex-shrink-0"
                          >
                            <path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="flex-1 truncate">
                            이어 보기: {resumeItem.title ?? ''}
                          </span>
                        </Link>
                      </li>
                    )
                  ) : (
                    /* 비로그인 상태: 이어 보기 / 학습 기록 로그인 유도 CTA */
                    <li>
                      <Link
                        href="/login"
                        className={cn(
                          'flex items-center gap-3 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2.5 text-sm font-medium text-blue-600 transition-colors',
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
                          className="h-5 w-5 flex-shrink-0"
                        >
                          <path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="flex-1">로그인하면 이어 보기가 가능합니다</span>
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                          className="h-4 w-4 flex-shrink-0 text-blue-400"
                        >
                          <path d="M9 18l6-6-6-6" />
                        </svg>
                      </Link>
                    </li>
                  )}

                  {/* 기본 메뉴 */}
                  {visibleItems.map((item) => {
                    const active = isActive(item.href);
                    const isExpanded = expanded === item.href;
                    const locked = !!(item.requiresAuth && !isLoggedIn);

                    // 비로그인 상태의 인증 필요 항목: 잠금 스타일로 로그인 페이지로 연결
                    if (locked) {
                      return (
                        <li key={item.href}>
                          <Link
                            href={`/login?redirectTo=${encodeURIComponent(item.href)}`}
                            title="로그인이 필요한 기능입니다"
                            className={cn(
                              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1',
                              'text-gray-400 hover:bg-gray-50 hover:text-gray-500',
                            )}
                          >
                            <NavIcon path={item.iconPath} />
                            <span className="flex-1">{item.label}</span>
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden="true"
                              className="h-4 w-4 text-gray-300"
                            >
                              <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          </Link>
                        </li>
                      );
                    }

                    if (!item.children) {
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            aria-current={active ? 'page' : undefined}
                            className={cn(
                              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1',
                              active
                                ? 'bg-blue-50 text-blue-700'
                                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
                            )}
                          >
                            <NavIcon path={item.iconPath} />
                            {item.label}
                          </Link>
                        </li>
                      );
                    }

                    return (
                      <li key={item.href}>
                        <button
                          type="button"
                          aria-expanded={isExpanded}
                          onClick={() => toggleExpanded(item.href)}
                          className={cn(
                            'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1',
                            active || isExpanded
                              ? 'bg-blue-50 text-blue-700'
                              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
                          )}
                        >
                          <NavIcon path={item.iconPath} />
                          <span className="flex-1 text-left">{item.label}</span>
                          <ChevronRight open={isExpanded} />
                        </button>

                        {isExpanded && (
                          <ul className="mt-1 ml-4 space-y-1 border-l-2 border-gray-100 pl-3">
                            {item.children.map((child) => {
                              const childActive = pathname === child.href;
                              return (
                                <li key={child.href}>
                                  <Link
                                    href={child.href}
                                    aria-current={childActive ? 'page' : undefined}
                                    className={cn(
                                      'block rounded-lg px-3 py-2 text-sm transition-colors',
                                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1',
                                      childActive
                                        ? 'font-medium text-blue-700'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                                    )}
                                  >
                                    {child.label}
                                  </Link>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </li>
                    );
                  })}

                  {/* 세그먼트 메뉴 (로딩 완료 후 표시) */}
                  {segmentItems.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={isActive(item.href) ? 'page' : undefined}
                        className={cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1',
                          isActive(item.href)
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
                        )}
                      >
                        <NavIcon path={item.iconPath} />
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>

                {/* 구분선 + 인증 영역 */}
                <div aria-hidden="true" className="my-3 border-t border-gray-100" />

                <ul className="space-y-1">
                  {isLoggedIn ? (
                    <>
                      {/* 알림 */}
                      <li>
                        <button
                          type="button"
                          aria-expanded={notifOpen}
                          onClick={() => setNotifOpen((v) => !v)}
                          className={cn(
                            'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                            'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1',
                            notifOpen && 'bg-gray-100',
                          )}
                        >
                          <span className="relative flex h-5 w-5 flex-shrink-0 items-center justify-center">
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
                            <span className="absolute -right-1 -top-1">
                              {hasUnread && (
                                <span className="flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
                                  {unreadCount! > 99 ? '99+' : unreadCount}
                                </span>
                              )}
                            </span>
                          </span>
                          <span className="flex-1 text-left">알림</span>
                          {hasUnread && (
                            <span className="text-xs text-gray-400">읽지 않음 {unreadCount}개</span>
                          )}
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                            className={cn(
                              'h-4 w-4 flex-shrink-0 transition-transform duration-200',
                              notifOpen && 'rotate-90',
                            )}
                          >
                            <path d="M9 18l6-6-6-6" />
                          </svg>
                        </button>

                        {/* 인라인 알림 패널 */}
                        {notifOpen && (
                          <div className="mt-1 ml-4 overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
                            {/* 전체 읽음 버튼 */}
                            {hasUnread && (
                              <div className="flex justify-end border-b border-gray-100 px-3 py-2">
                                <button
                                  type="button"
                                  onClick={handleMarkAllRead}
                                  className="text-xs text-blue-600 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
                                >
                                  전체 읽음
                                </button>
                              </div>
                            )}

                            <ul className="max-h-60 overflow-y-auto">
                              {/* 로딩 */}
                              {notificationsLoading && (
                                <>
                                  {[1, 2, 3].map((i) => (
                                    <li key={i} className="flex flex-col gap-1.5 px-3 py-2.5">
                                      <div className="h-3 w-3/4 animate-pulse rounded bg-gray-200" />
                                      <div className="h-2.5 w-1/3 animate-pulse rounded bg-gray-100" />
                                    </li>
                                  ))}
                                </>
                              )}

                              {/* 에러 */}
                              {!notificationsLoading && notificationsError && (
                                <li className="px-3 py-6 text-center text-xs text-red-500">
                                  알림을 불러오지 못했습니다.
                                </li>
                              )}

                              {/* Empty */}
                              {!notificationsLoading &&
                                !notificationsError &&
                                notifications !== null &&
                                notifications.length === 0 && (
                                  <li className="px-3 py-6 text-center text-xs text-gray-400">
                                    알림이 없습니다.
                                  </li>
                                )}

                              {/* 목록 */}
                              {!notificationsLoading &&
                                !notificationsError &&
                                notifications &&
                                notifications.map((item: NotificationItemResponse) => (
                                  <li key={item.id}>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (!item.isRead && item.id) markRead(item.id);
                                      }}
                                      className={cn(
                                        'flex w-full flex-col gap-0.5 px-3 py-2.5 text-left transition-colors',
                                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500',
                                        !item.isRead
                                          ? 'bg-blue-50 hover:bg-blue-100'
                                          : 'hover:bg-gray-100',
                                      )}
                                    >
                                      <div className="flex items-start gap-1.5">
                                        {!item.isRead && (
                                          <span
                                            aria-hidden="true"
                                            className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500"
                                          />
                                        )}
                                        <span
                                          className={cn(
                                            'flex-1 text-xs leading-snug',
                                            item.isRead
                                              ? 'text-gray-500'
                                              : 'font-medium text-gray-900',
                                          )}
                                        >
                                          {item.message}
                                        </span>
                                      </div>
                                      <span className="pl-3 text-[11px] text-gray-400">
                                        {formatDate(item.createdAt)}
                                      </span>
                                    </button>
                                  </li>
                                ))}
                            </ul>
                          </div>
                        )}
                      </li>

                      {/* 내 정보 */}
                      <li>
                        <Link
                          href="/my/profile"
                          aria-current={pathname === '/my/profile' ? 'page' : undefined}
                          className={cn(
                            'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1',
                            pathname.startsWith('/my')
                              ? 'bg-blue-50 text-blue-700'
                              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
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
                            className="h-5 w-5 flex-shrink-0"
                          >
                            <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          내 정보
                        </Link>
                      </li>

                      {/* 로그아웃 */}
                      <li>
                        <button
                          type="button"
                          onClick={() => void handleLogout()}
                          className={cn(
                            'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                            'text-red-600 hover:bg-red-50 hover:text-red-700',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-1',
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
                            className="h-5 w-5 flex-shrink-0"
                          >
                            <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          로그아웃
                        </button>
                      </li>
                    </>
                  ) : (
                    <>
                      {/* 로그인 */}
                      <li>
                        <Link
                          href="/login"
                          className={cn(
                            'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1',
                            pathname === '/login'
                              ? 'bg-blue-50 text-blue-700'
                              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
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
                            className="h-5 w-5 flex-shrink-0"
                          >
                            <path d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                          </svg>
                          로그인
                        </Link>
                      </li>

                      {/* 회원가입 */}
                      <li>
                        <Link
                          href="/login"
                          className={cn(
                            'flex items-center gap-3 rounded-lg bg-blue-600 px-3 py-2.5 text-sm font-medium text-white transition-colors',
                            'hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1',
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
                            className="h-5 w-5 flex-shrink-0"
                          >
                            <path d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                          </svg>
                          회원가입
                        </Link>
                      </li>
                    </>
                  )}
                </ul>
              </nav>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
