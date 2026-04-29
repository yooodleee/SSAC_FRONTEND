'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import type { components } from '@/api-contract/generated/api-types';

type NotificationItemResponse = components['schemas']['NotificationItemResponse'];

interface NotificationDropdownProps {
  loading: boolean;
  error: boolean;
  notifications: NotificationItemResponse[] | null;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onClose: () => void;
}

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

function SkeletonItem() {
  return (
    <li className="flex flex-col gap-1.5 px-4 py-3">
      <div className="h-3.5 w-3/4 animate-pulse rounded bg-gray-200" />
      <div className="h-3 w-1/3 animate-pulse rounded bg-gray-100" />
    </li>
  );
}

export function NotificationDropdown({
  loading,
  error,
  notifications,
  onMarkRead,
  onMarkAllRead,
  onClose,
}: NotificationDropdownProps) {
  const ref = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 닫기
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  // Escape 키로 닫기
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const hasUnread = notifications ? notifications.some((n) => !n.isRead) : false;

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label="알림 목록"
      className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg"
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <span className="text-sm font-semibold text-gray-900">알림</span>
        {hasUnread && (
          <button
            type="button"
            onClick={onMarkAllRead}
            className="text-xs text-blue-600 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
          >
            전체 읽음
          </button>
        )}
      </div>

      {/* 본문 */}
      <ul className="max-h-80 overflow-y-auto">
        {/* 로딩 스켈레톤 */}
        {loading && (
          <>
            <SkeletonItem />
            <SkeletonItem />
            <SkeletonItem />
          </>
        )}

        {/* 에러 */}
        {!loading && error && (
          <li className="px-4 py-8 text-center text-sm text-red-500">
            알림을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
          </li>
        )}

        {/* Empty State */}
        {!loading && !error && notifications !== null && notifications.length === 0 && (
          <li className="px-4 py-8 text-center text-sm text-gray-400">알림이 없습니다.</li>
        )}

        {/* 알림 목록 */}
        {!loading &&
          !error &&
          notifications &&
          notifications.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => {
                  if (!item.isRead && item.id) onMarkRead(item.id);
                }}
                className={cn(
                  'flex w-full flex-col gap-0.5 px-4 py-3 text-left transition-colors hover:bg-gray-50',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500',
                  !item.isRead && 'bg-blue-50 hover:bg-blue-100',
                )}
              >
                <div className="flex items-start gap-2">
                  {/* 읽지 않음 점 표시 */}
                  {!item.isRead && (
                    <span
                      aria-hidden="true"
                      className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500"
                    />
                  )}
                  <span
                    className={cn(
                      'flex-1 text-sm leading-snug',
                      item.isRead ? 'text-gray-500' : 'font-medium text-gray-900',
                    )}
                  >
                    {item.message}
                  </span>
                </div>
                <span className="pl-3.5 text-xs text-gray-400">{formatDate(item.createdAt)}</span>
              </button>
            </li>
          ))}
      </ul>
    </div>
  );
}
