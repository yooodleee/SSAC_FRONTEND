'use client';

import { useCallback } from 'react';
import { usePathname } from 'next/navigation';

const ENDPOINT = '/api/events/menu-click';

/**
 * 메뉴 클릭 이벤트 트래킹 훅
 *
 * - sendBeacon 우선: 페이지 이탈 시에도 이벤트 유실 방지
 * - fetch(keepalive) 폴백: sendBeacon 미지원 환경 대응
 * - Silent Fail: 전송 실패가 사용자 경험에 영향 없음
 * - Fire-and-forget: 페이지 이동을 지연시키지 않음
 */
export function useMenuTracking() {
  const pathname = usePathname();

  const track = useCallback(
    (menuId: string, menuName: string) => {
      const payload = {
        eventType: 'MENU_CLICK' as const,
        menuId,
        menuName,
        clickedAt: new Date().toISOString(),
        pageContext: pathname,
      };

      const json = JSON.stringify(payload);

      // sendBeacon: 페이지 이탈 후에도 전송 보장
      if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
        const blob = new Blob([json], { type: 'application/json' });
        const queued = navigator.sendBeacon(ENDPOINT, blob);
        if (queued) return;
        // sendBeacon 큐 초과(false 반환) 시 fetch 폴백
      }

      // fetch with keepalive: sendBeacon 미지원 또는 큐 초과 시 폴백
      fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: json,
        keepalive: true,
      }).catch(() => {
        // silent fail: 이벤트 전송 실패가 서비스 기능에 영향을 주지 않음
      });
    },
    [pathname],
  );

  return { track };
}
