'use client';

import { Suspense, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function KakaoSpinner() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[#FEE500]" />
      <p className="text-sm text-gray-500">카카오 로그인 처리 중...</p>
    </div>
  );
}

/** 외부 URL로의 오픈 리다이렉트를 방지: 상대 경로만 허용 */
function getSafeRedirectTo(raw: string | null): string {
  const path = raw ?? '/';
  if (!path.startsWith('/') || path.startsWith('//')) return '/';
  return path;
}

function KakaoCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const calledRef = useRef(false);

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;

    const authCode = searchParams.get('authCode');
    const error = searchParams.get('error');

    if (error) {
      router.replace('/login?error=KAKAO_AUTH_CANCEL');
      return;
    }

    if (!authCode) {
      router.replace('/login?error=KAKAO_AUTH_FAILED');
      return;
    }

    const controller = new AbortController();

    fetch('/api/v1/auth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authCode }),
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as { errorCode?: string };
          router.replace(`/login?error=${data.errorCode ?? 'SERVER_ERROR'}`);
          return;
        }
        const data = (await res.json()) as {
          isNewUser: boolean;
          tempToken?: string;
          provider?: string;
        };

        // 클라이언트측 비회원 식별 정보 제거 (BFF 쿠키 삭제와 이중 보장)
        document.cookie = 'guestId=; Max-Age=0; path=/';

        // 신규 회원: tempToken 저장 후 약관 동의 페이지로 이동
        if (data.isNewUser) {
          if (data.tempToken) sessionStorage.setItem('signupTempToken', data.tempToken);
          if (data.provider) sessionStorage.setItem('signupProvider', data.provider);
          router.replace('/signup/terms');
          return;
        }

        // 기존 회원: 로그인 전 페이지로 이동
        // window.location.replace 사용 — Header(Server Component)가 새 accessToken 쿠키를 반드시 읽도록 강제
        const redirectTo = getSafeRedirectTo(sessionStorage.getItem('kakaoRedirectTo'));
        sessionStorage.removeItem('kakaoRedirectTo');
        window.location.replace(redirectTo);
      })
      .catch((err: unknown) => {
        if (err instanceof Error && err.name === 'AbortError') return;
        router.replace('/login?error=SERVER_ERROR');
      });

    return () => {
      controller.abort();
    };
  }, [router, searchParams]);

  return <KakaoSpinner />;
}

export default function KakaoCallbackPage() {
  return (
    <Suspense fallback={<KakaoSpinner />}>
      <KakaoCallbackContent />
    </Suspense>
  );
}
