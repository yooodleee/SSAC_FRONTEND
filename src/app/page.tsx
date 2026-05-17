'use client';

import { Suspense, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAutoLogin } from '@/hooks/useAutoLogin';

const Spinner = () => (
  <div className="flex min-h-screen items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
  </div>
);

/**
 * Kakao OAuth 브리지:
 * BE의 Spring Security 성공 핸들러가 redirectTo='/' 설정으로 인해
 * authCode를 루트 경로(?authCode=...)로 보내는 경우를 처리한다.
 * authCode를 /auth/kakao/callback으로 전달해 기존 콜백 플로우를 재사용한다.
 */
function KakaoAuthCodeBridge({ authCode }: { authCode: string }) {
  const router = useRouter();
  const calledRef = useRef(false);

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;
    router.replace(`/auth/kakao/callback?authCode=${encodeURIComponent(authCode)}`);
  }, [authCode, router]);

  return <Spinner />;
}

/** 자동 로그인 게이트웨이: refreshToken으로 세션 복원 후 라우팅 결정 */
function AutoLoginGateway() {
  useAutoLogin();
  return <Spinner />;
}

/**
 * 앱 진입점 — 자동 로그인 게이트웨이
 *
 * 1. authCode 파라미터가 있는 경우 (Kakao OAuth BE 리다이렉트):
 *    → /auth/kakao/callback으로 전달 (authCode 교환 플로우)
 *
 * 2. authCode 파라미터가 없는 경우 (일반 진입):
 *    - refreshToken 유효 + 온보딩 완료   → /home
 *    - refreshToken 유효 + 온보딩 미완료  → /onboarding/test
 *    - refreshToken 없음/만료             → /login
 */
function RootContent() {
  const searchParams = useSearchParams();
  const authCode = searchParams.get('authCode');

  if (authCode) {
    return <KakaoAuthCodeBridge authCode={authCode} />;
  }

  return <AutoLoginGateway />;
}

export default function RootPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <RootContent />
    </Suspense>
  );
}
