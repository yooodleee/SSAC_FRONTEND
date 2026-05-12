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

    const token = searchParams.get('token');
    const tempToken = searchParams.get('tempToken');
    const provider = searchParams.get('provider');
    const error = searchParams.get('error');
    // BE가 신규 사용자임을 알릴 때 추가하는 파라미터
    const isNewUser = searchParams.get('isNewUser') === 'true';

    if (error) {
      router.replace('/login?error=KAKAO_AUTH_CANCEL');
      return;
    }

    // 신규 사용자: BE가 tempToken과 함께 리다이렉트 — BFF 호출 없이 바로 회원가입 플로우 진입
    if (isNewUser && tempToken) {
      sessionStorage.setItem('signupTempToken', tempToken);
      if (provider) sessionStorage.setItem('signupProvider', provider);
      document.cookie = 'guestId=; Max-Age=0; path=/';
      router.replace('/signup/terms');
      return;
    }

    if (!token) {
      router.replace('/login?error=KAKAO_AUTH_FAILED');
      return;
    }

    const controller = new AbortController();

    const bffUrl = new URL('/api/auth/kakao/callback', window.location.origin);
    bffUrl.searchParams.set('token', token);

    fetch(bffUrl.toString(), { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as { errorCode?: string };
          router.replace(`/login?error=${data.errorCode ?? 'SERVER_ERROR'}`);
          return;
        }
        // 클라이언트측 비회원 식별 정보 제거 (BFF 쿠키 삭제와 이중 보장)
        document.cookie = 'guestId=; Max-Age=0; path=/';
        // 기존 사용자: 로그인 전 페이지로 이동
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
