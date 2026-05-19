/* eslint-disable @next/next/no-img-element */
/**
 * 앱 진입점 — 브랜딩 랜딩 홈 (/)
 *
 * 라우팅 분기:
 *   / → 브랜딩 랜딩 홈 (인증 상태와 무관하게 접근 가능)
 *   /home → 맞춤 홈 화면 (로그인 필요)
 *
 * 특이 동작:
 *   - authCode 파라미터가 있는 경우 (Kakao OAuth BE 리다이렉트):
 *     → /auth/kakao/callback으로 전달 (authCode 교환 플로우)
 *   - isLoggedIn: 서버에서 accessToken 쿠키 확인 후 Client에 전달
 *     → 전역 Header는 pathname='/'이면 null 반환 (LandingHeader가 대신 렌더링)
 */

import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { LandingPageClient } from '@/features/landing/LandingPageClient';
const prefersReducedMotion =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function LandingSpinner() {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
      role="status"
      aria-label="페이지를 불러오는 중입니다."
    >
      {prefersReducedMotion ? (
        <img src="/gress.png" alt="SSAC" width={80} height={80} />
      ) : (
        <img src="/assets/ssac-loading.gif" alt="로딩 중" width={200} height={200} />
      )}
    </div>
  );
}

export default async function RootPage() {
  const cookieStore = await cookies();
  const isLoggedIn = cookieStore.has('accessToken');

  return (
    <Suspense fallback={<LandingSpinner />}>
      <LandingPageClient isLoggedIn={isLoggedIn} />
    </Suspense>
  );
}
