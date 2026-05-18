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

function LandingSpinner() {
  return (
    <div
      className="flex min-h-screen items-center justify-center"
      style={{ backgroundColor: '#1a1a1a' }}
    >
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
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
