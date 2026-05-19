/* eslint-disable @next/next/no-img-element */
'use client';

// /home, /home/account-settings, /home/content-history 탭 전환 시 적용
// 루트 loading.tsx보다 가까운 경로에 위치하므로 /home/* 전환에 우선 적용됨

const prefersReducedMotion =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function HomeLoading() {
  return (
    <div
      style={{
        width: '100%',
        height: '100vh',
        background: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      role="status"
      aria-label="페이지를 불러오는 중입니다."
    >
      {prefersReducedMotion ? (
        <img src="/gress.png" alt="SSAC" width={80} height={80} />
      ) : (
        <img src="/assets/ssac-loading.gif" alt="로딩 중" width={160} height={160} />
      )}
    </div>
  );
}
