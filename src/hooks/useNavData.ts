'use client';

import { useState, useEffect } from 'react';
import type { NavNotificationsData, NavResumeData, NavResumeItem, UserSegment } from '@/types';

interface NavData {
  /** null = 에러/데이터 없음, number = 로드 완료 */
  unreadCount: number | null;
  /** true = 아직 응답 없음(isLoggedIn 상태에서) */
  notificationsLoading: boolean;
  /** null = 에러/없음, NavResumeItem = 로드 완료 */
  resumeItem: NavResumeItem | null;
  resumeLoading: boolean;
  segment: UserSegment | null;
  segmentLoading: boolean;
  markAllRead: () => void;
}

/**
 * undefined = 아직 응답 없음(로딩 중)
 * null/값    = 응답 완료
 *
 * 설계 원칙: useEffect 본문에서 동기 setState를 호출하지 않는다.
 * 모든 setX는 비동기 콜백(.then / .catch)에서만 호출된다.
 * 로딩 여부는 값이 undefined인지로 파생(derived)한다.
 */
export function useNavData(isLoggedIn: boolean): NavData {
  const [unreadCount, setUnreadCount] = useState<number | undefined>(undefined);
  const [resumeItem, setResumeItem] = useState<NavResumeItem | null | undefined>(undefined);
  const [segment, setSegment] = useState<UserSegment | null | undefined>(undefined);

  useEffect(() => {
    if (!isLoggedIn) return;

    fetch('/api/nav/notifications')
      .then((r) => (r.ok ? (r.json() as Promise<NavNotificationsData>) : Promise.reject()))
      .then((data) => setUnreadCount(data.unreadCount))
      .catch(() => setUnreadCount(0));

    fetch('/api/nav/resume')
      .then((r) => (r.ok ? (r.json() as Promise<NavResumeData>) : Promise.reject()))
      .then((data) => setResumeItem(data.item))
      .catch(() => setResumeItem(null));

    fetch('/api/nav/user-segment')
      .then((r) =>
        r.ok ? (r.json() as Promise<{ segment: UserSegment | null }>) : Promise.reject(),
      )
      .then((data) => setSegment(data.segment))
      .catch(() => setSegment(null));
  }, [isLoggedIn]);

  return {
    unreadCount: unreadCount ?? null,
    notificationsLoading: isLoggedIn && unreadCount === undefined,
    resumeItem: resumeItem ?? null,
    resumeLoading: isLoggedIn && resumeItem === undefined,
    segment: segment ?? null,
    segmentLoading: isLoggedIn && segment === undefined,
    markAllRead: () => setUnreadCount(0),
  };
}
