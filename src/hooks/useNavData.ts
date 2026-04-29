'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { components } from '@/api-contract/generated/api-types';

type ResumeContentResponse = components['schemas']['ResumeContentResponse'];
type NotificationItemResponse = components['schemas']['NotificationItemResponse'];
type NotificationListResponse = components['schemas']['NotificationListResponse'];
type ResumeResponse = components['schemas']['ResumeResponse'];
type UserSegmentResponse = components['schemas']['UserSegmentResponse'];

interface NavData {
  /** null = 에러/데이터 없음, number = 로드 완료 */
  unreadCount: number | null;
  /** true = 아직 응답 없음(isLoggedIn 상태에서) */
  notificationsLoading: boolean;
  /** null = 에러 발생 */
  notificationsError: boolean;
  notifications: NotificationItemResponse[] | null;
  markRead: (id: string) => void;
  markAllRead: () => void;
  /** null = 에러/없음, ResumeContentResponse = 로드 완료 */
  resumeItem: ResumeContentResponse | null;
  resumeLoading: boolean;
  segment: string | null;
  segmentLoading: boolean;
}

/**
 * undefined = 아직 응답 없음(로딩 중)
 * null/값    = 응답 완료
 */
export function useNavData(isLoggedIn: boolean): NavData {
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState<number | undefined>(undefined);
  const [notifications, setNotifications] = useState<NotificationItemResponse[] | null | undefined>(
    undefined,
  );
  const [notificationsError, setNotificationsError] = useState(false);
  const [resumeItem, setResumeItem] = useState<ResumeContentResponse | null | undefined>(undefined);
  const [segment, setSegment] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    if (!isLoggedIn) return;

    fetch('/api/nav/notifications')
      .then((r) => {
        if (r.status === 401) {
          router.push('/login');
          return Promise.reject(new Error('401'));
        }
        return r.ok ? (r.json() as Promise<NotificationListResponse>) : Promise.reject();
      })
      .then((data) => {
        setUnreadCount(data.unreadCount ?? 0);
        setNotifications(data.notifications ?? []);
      })
      .catch((e: unknown) => {
        if (e instanceof Error && e.message === '401') return;
        setUnreadCount(0);
        setNotifications(null);
        setNotificationsError(true);
      });

    fetch('/api/nav/resume')
      .then((r) => (r.ok ? (r.json() as Promise<ResumeResponse>) : Promise.reject()))
      .then((data) => setResumeItem(data.hasResume ? (data.content ?? null) : null))
      .catch(() => setResumeItem(null));

    fetch('/api/nav/user-segment')
      .then((r) => (r.ok ? (r.json() as Promise<UserSegmentResponse>) : Promise.reject()))
      .then((data) => setSegment(data.segment ?? null))
      .catch(() => setSegment(null));
  }, [isLoggedIn, router]);

  const markRead = useCallback(
    (id: string) => {
      // 낙관적 업데이트
      setNotifications((prev) =>
        prev ? prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)) : prev,
      );
      setUnreadCount((prev) => (prev !== undefined && prev > 0 ? prev - 1 : 0));

      fetch(`/api/notification/${id}/read`, { method: 'PATCH' })
        .then((r) => {
          if (r.status === 401) router.push('/login');
        })
        .catch(() => {
          // 실패 시 롤백 없이 재조회 가능하도록 에러 무시 (낙관적 업데이트 유지)
        });
    },
    [router],
  );

  const markAllRead = useCallback(() => {
    // 낙관적 업데이트
    setNotifications((prev) => (prev ? prev.map((n) => ({ ...n, isRead: true })) : prev));
    setUnreadCount(0);

    fetch('/api/notification/read-all', { method: 'PATCH' })
      .then((r) => {
        if (r.status === 401) router.push('/login');
      })
      .catch(() => {
        // 실패 시 낙관적 업데이트 유지
      });
  }, [router]);

  return {
    unreadCount: unreadCount ?? null,
    notificationsLoading: isLoggedIn && unreadCount === undefined,
    notificationsError,
    notifications: notifications ?? null,
    markRead,
    markAllRead,
    resumeItem: resumeItem ?? null,
    resumeLoading: isLoggedIn && resumeItem === undefined,
    segment: segment ?? null,
    segmentLoading: isLoggedIn && segment === undefined,
  };
}
