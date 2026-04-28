'use client';

import { Suspense, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function NaverSpinner() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[#03C75A]" />
      <p className="text-sm text-gray-500">네이버 로그인 처리 중...</p>
    </div>
  );
}

function NaverCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const calledRef = useRef(false);

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;

    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // 사용자가 네이버 인증 페이지에서 취소한 경우
    if (error) {
      router.replace('/login?error=NAVER_AUTH_CANCEL');
      return;
    }

    if (!code || !state) {
      router.replace('/login?error=NAVER_AUTH_FAILED');
      return;
    }

    const controller = new AbortController();

    const bffUrl = new URL('/api/auth/naver/callback', window.location.origin);
    bffUrl.searchParams.set('code', code);
    bffUrl.searchParams.set('state', state);

    fetch(bffUrl.toString(), { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as { errorCode?: string };
          router.replace(`/login?error=${data.errorCode ?? 'SERVER_ERROR'}`);
          return;
        }
        // 비회원 퀴즈 기록 병합 완료 신호 확인 → sessionStorage에 저장 후 PostLoginToast가 표시
        const data = (await res.json().catch(() => ({}))) as { guestQuizMerged?: boolean };
        if (data.guestQuizMerged) {
          sessionStorage.setItem('quizMergeNotice', '1');
        }
        // 클라이언트측 비회원 식별 정보 제거 (BFF 쿠키 삭제와 이중 보장)
        document.cookie = 'guestId=; Max-Age=0; path=/';
        // 로그인 성공: 버튼 클릭 시 저장해둔 redirectTo로 이동
        const redirectTo = sessionStorage.getItem('naverRedirectTo') ?? '/';
        sessionStorage.removeItem('naverRedirectTo');
        router.replace(redirectTo);
        router.refresh();
      })
      .catch((err: unknown) => {
        if (err instanceof Error && err.name === 'AbortError') return;
        router.replace('/login?error=SERVER_ERROR');
      });

    // 인증 처리 중 이탈 시 요청 취소 → 인증 상태 초기화
    return () => {
      controller.abort();
    };
  }, [router, searchParams]);

  return <NaverSpinner />;
}

export default function NaverCallbackPage() {
  return (
    <Suspense fallback={<NaverSpinner />}>
      <NaverCallbackContent />
    </Suspense>
  );
}
