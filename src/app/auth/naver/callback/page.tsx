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

/** 외부 URL로의 오픈 리다이렉트를 방지: 상대 경로만 허용 */
function getSafeRedirectTo(raw: string | null): string {
  const path = raw ?? '/';
  if (!path.startsWith('/') || path.startsWith('//')) return '/';
  return path;
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
    // Naver가 에러 시 전달하는 파라미터 ('error' 또는 'error_code')
    const error = searchParams.get('error') ?? searchParams.get('error_code');
    // BE OAuth 처리 실패 시 전달하는 파라미터 ('loginError')
    const loginError = searchParams.get('loginError');
    // BE가 신규 사용자임을 알릴 때 추가하는 파라미터
    const isNewUserParam = searchParams.get('isNewUser');
    const tempToken = searchParams.get('tempToken');
    const provider = searchParams.get('provider');

    // Case 1: 사용자가 네이버 인증 페이지에서 취소한 경우
    if (error) {
      router.replace('/login?error=NAVER_AUTH_CANCEL');
      return;
    }

    // Case 2: BE OAuth 처리 실패 (state 불일치 등)
    if (loginError) {
      router.replace('/login?error=NAVER_AUTH_FAILED');
      return;
    }

    if (!code || !state) {
      // Case 3: 신규 사용자 — BE가 tempToken과 함께 리다이렉트
      if (isNewUserParam === 'true' && tempToken) {
        sessionStorage.setItem('signupTempToken', tempToken);
        if (provider) sessionStorage.setItem('signupProvider', provider);
        document.cookie = 'guestId=; Max-Age=0; path=/';
        router.replace('/signup/terms');
        return;
      }

      // Case 4: 기존 사용자 — BE가 isNewUser=false와 함께 리다이렉트
      // 네이버 OAuth는 BE가 콜백을 직접 수신 후 FE로 리다이렉트하는 구조.
      // BE가 토큰을 URL에 포함하지 않으므로 BFF를 통한 쿠키 설정이 불가능.
      // TODO: BE가 카카오처럼 ?token=<accessToken> 을 포함해 리다이렉트하도록 수정 필요.
      if (isNewUserParam === 'false') {
        document.cookie = 'guestId=; Max-Age=0; path=/';
        const redirectTo = getSafeRedirectTo(sessionStorage.getItem('naverRedirectTo'));
        sessionStorage.removeItem('naverRedirectTo');
        window.location.replace(redirectTo);
        return;
      }

      // Case 5: 엣지케이스 — reissue로 인증 상태 확인
      fetch('/api/v1/auth/reissue', { method: 'POST' })
        .then((res) => {
          if (res.ok) {
            document.cookie = 'guestId=; Max-Age=0; path=/';
            const redirectTo = getSafeRedirectTo(sessionStorage.getItem('naverRedirectTo'));
            sessionStorage.removeItem('naverRedirectTo');
            // window.location.replace 사용 — Header(Server Component)가 새 accessToken 쿠키를 반드시 읽도록 강제
            window.location.replace(redirectTo);
          } else {
            router.replace('/login?error=NAVER_AUTH_FAILED');
          }
        })
        .catch(() => {
          router.replace('/login?error=NAVER_AUTH_FAILED');
        });
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
        const data = (await res.json().catch(() => ({}))) as {
          guestQuizMerged?: boolean;
          isNewUser?: boolean;
          tempToken?: string;
          provider?: string;
        };
        // 비회원 퀴즈 기록 병합 완료 신호 확인 → sessionStorage에 저장 후 PostLoginToast가 표시
        if (data.guestQuizMerged) {
          sessionStorage.setItem('quizMergeNotice', '1');
        }
        // 클라이언트측 비회원 식별 정보 제거 (BFF 쿠키 삭제와 이중 보장)
        document.cookie = 'guestId=; Max-Age=0; path=/';
        // 신규 사용자: tempToken을 저장한 뒤 약관 동의 페이지로 이동 (뒤로가기 방지)
        if (data.isNewUser) {
          if (data.tempToken) sessionStorage.setItem('signupTempToken', data.tempToken);
          if (data.provider) sessionStorage.setItem('signupProvider', data.provider);
          router.replace('/signup/terms');
          return;
        }
        // 기존 사용자: 로그인 전 페이지로 이동
        // window.location.replace 사용 — Header(Server Component)가 새 accessToken 쿠키를 반드시 읽도록 강제
        const redirectTo = getSafeRedirectTo(sessionStorage.getItem('naverRedirectTo'));
        sessionStorage.removeItem('naverRedirectTo');
        window.location.replace(redirectTo);
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
