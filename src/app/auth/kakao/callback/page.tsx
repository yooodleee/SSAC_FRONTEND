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

function KakaoCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const calledRef = useRef(false);

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;

    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      router.replace('/login?error=KAKAO_AUTH_CANCEL');
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
        // 로그인 성공: 버튼 클릭 시 저장해둔 redirectTo로 이동
        const redirectTo = sessionStorage.getItem('kakaoRedirectTo') ?? '/';
        sessionStorage.removeItem('kakaoRedirectTo');
        router.replace(redirectTo);
        router.refresh();
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
