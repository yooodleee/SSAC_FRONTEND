'use client';

/**
 * LoginPageClient — 로그인 페이지 클라이언트 컴포넌트
 *
 * 레이아웃:
 *   데스크탑: 좌 40% (다크그린 #1B4332) + 우 60% (흰색)
 *   모바일: 세로 스택 (좌 패널 → 우 패널)
 *
 * - Kakao / Naver 소셜 로그인
 * - 로딩 상태: 클릭 시 전체 버튼 비활성화 + 스피너
 * - 에러 코드별 메시지 (URL ?error= 파라미터)
 * - 회원가입 버튼 → /signup/terms
 */

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { env } from '@/lib/env';
import { cn } from '@/lib/utils';

const ERROR_MESSAGES: Record<string, string> = {
  KAKAO_AUTH_FAILED: '카카오 인증에 실패했습니다. 다시 시도해주세요.',
  KAKAO_AUTH_CANCEL: '카카오 로그인이 취소되었습니다.',
  NAVER_AUTH_FAILED: '네이버 인증에 실패했습니다. 다시 시도해주세요.',
  NAVER_AUTH_CANCEL: '네이버 로그인이 취소되었습니다.',
  SERVER_ERROR: '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
  SESSION_EXPIRED: '세션이 만료되었습니다. 다시 로그인해주세요.',
};

const EMAIL_LOGIN_ERRORS: Record<string, string> = {
  'AUTH-011': '이메일 또는 비밀번호가 올바르지 않습니다.',
  SERVER_ERROR: '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
};

export function LoginPageClient() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') ?? '/';
  const sessionRedirectTo = redirectTo === '/' ? '/home' : redirectTo;
  const errorCode = searchParams.get('error');
  const errorMessage = errorCode
    ? (ERROR_MESSAGES[errorCode] ?? '오류가 발생했습니다. 다시 시도해주세요.')
    : null;

  const [isKakaoLoading, setIsKakaoLoading] = useState(false);
  const [isNaverLoading, setIsNaverLoading] = useState(false);

  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [emailLoginError, setEmailLoginError] = useState('');

  const isLoading = isKakaoLoading || isNaverLoading || isEmailLoading;

  async function handleEmailLogin() {
    if (isLoading || !emailInput.trim() || !passwordInput) return;
    setIsEmailLoading(true);
    setEmailLoginError('');
    try {
      const res = await fetch('/api/v1/auth/login/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput.trim(), password: passwordInput }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { errorCode?: string };
        const code = data.errorCode ?? 'SERVER_ERROR';
        setEmailLoginError(
          EMAIL_LOGIN_ERRORS[code] ?? '로그인 중 오류가 발생했습니다. 다시 시도해주세요.',
        );
        return;
      }
      window.location.replace(sessionRedirectTo);
    } catch {
      setEmailLoginError('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsEmailLoading(false);
    }
  }

  const handleKakaoLogin = () => {
    if (isLoading) return;
    setIsKakaoLoading(true);
    sessionStorage.setItem('kakaoRedirectTo', sessionRedirectTo);
    const kakaoUrl = new URL('/oauth2/authorization/kakao', env.backendUrl);
    kakaoUrl.searchParams.set('redirectTo', redirectTo);
    window.location.href = kakaoUrl.toString();
  };

  const handleNaverLogin = () => {
    if (isLoading) return;
    setIsNaverLoading(true);
    sessionStorage.setItem('naverRedirectTo', sessionRedirectTo);
    window.location.href = `${env.backendUrl}/api/v1/auth/naver/login`;
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* ── 좌측 패널 — 40% 다크그린 ─────────────────────────────────────── */}
      <div
        className="relative flex flex-col items-center justify-center px-8 py-16 md:min-h-screen md:w-[40%]"
        style={{ backgroundColor: '#1B4332' }}
      >
        {/* 뒤로가기 + 로고 (좌상단) */}
        <div className="absolute top-6 left-6">
          <Link
            href="/"
            aria-label="홈으로 돌아가기"
            className="flex items-center gap-2 rounded-md text-white/80 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M19 12H5M5 12l7 7M5 12l7-7" />
            </svg>
            <Image
              src="/gress.png"
              alt="SSAC 마스코트"
              width={22}
              height={22}
              className="object-contain"
            />
            <span className="text-sm font-semibold text-white">SSAC</span>
          </Link>
        </div>

        {/* 브랜딩 텍스트 — 수직 중앙 */}
        <div className="text-center">
          <h1
            className="font-bold text-white"
            style={{ fontSize: 'clamp(20px, 2.5vw, 28px)', lineHeight: 1.35 }}
          >
            SSAC.io 계정으로
            <br />
            <span style={{ color: '#FEE500' }}>로그인하기</span>
          </h1>
          <p className="mt-4 text-white/80" style={{ fontSize: '13px', lineHeight: 1.8 }}>
            외워야 할 비밀번호가 많아 불편하셨죠?
            <br />
            이제 소셜 로그인 계정을 이용하여 간편하게 로그인하세요
          </p>
          <p className="mt-2 text-white/55" style={{ fontSize: '12px' }}>
            * 이메일 인증 최초 인증 후 사용 가능
          </p>
        </div>
      </div>

      {/* ── 우측 패널 — 60% 흰색 ────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col items-center justify-center bg-white px-8 py-16 md:min-h-screen md:w-[60%]">
        <div className="w-full max-w-xs">
          {/* 에러 메시지 */}
          {errorMessage && (
            <div
              role="alert"
              className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-center text-sm text-red-600"
            >
              {errorMessage}
            </div>
          )}

          {/* 이메일 로그인 */}
          <div className="flex flex-col gap-3 mb-5">
            <div className="flex flex-col gap-2">
              <input
                type="email"
                value={emailInput}
                onChange={(e) => {
                  setEmailInput(e.target.value);
                  setEmailLoginError('');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleEmailLogin();
                }}
                placeholder="@example.com"
                autoComplete="email"
                disabled={isLoading}
                className={cn(
                  'h-[48px] w-full rounded-xl border px-4 text-sm text-[#1A1A1A] outline-none transition-colors',
                  'placeholder:text-[#BBBBBB]',
                  emailLoginError
                    ? 'border-red-400 focus:border-red-400'
                    : 'border-[#E8E8E8] focus:border-[#F97316]',
                  'disabled:opacity-60',
                )}
              />
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setEmailLoginError('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleEmailLogin();
                  }}
                  placeholder="••••"
                  autoComplete="current-password"
                  disabled={isLoading}
                  className={cn(
                    'h-[48px] w-full rounded-xl border px-4 pr-11 text-sm text-[#1A1A1A] outline-none transition-colors',
                    'placeholder:text-[#BBBBBB]',
                    emailLoginError
                      ? 'border-red-400 focus:border-red-400'
                      : 'border-[#E8E8E8] focus:border-[#F97316]',
                    'disabled:opacity-60',
                  )}
                />
                <button
                  type="button"
                  aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#BBBBBB] hover:text-[#6B6B6B] focus-visible:outline-none"
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
            </div>

            {emailLoginError && (
              <p role="alert" className="text-center text-xs text-red-500">
                {emailLoginError}
              </p>
            )}

            <button
              type="button"
              onClick={handleEmailLogin}
              disabled={isLoading || !emailInput.trim() || !passwordInput}
              className="flex h-[52px] w-full items-center justify-center rounded-xl text-[15px] font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              style={{ backgroundColor: '#F97316' }}
            >
              {isEmailLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              ) : (
                '로그인'
              )}
            </button>
          </div>

          {/* 구분선 */}
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-[#E8E8E8]" />
            <span className="text-xs text-[#BBBBBB]">또는 소셜 로그인</span>
            <div className="h-px flex-1 bg-[#E8E8E8]" />
          </div>

          {/* 로그인/회원가입 버튼 */}
          <div className="flex flex-col items-center gap-3">
            {/* 카카오 로그인 */}
            <button
              type="button"
              onClick={handleKakaoLogin}
              disabled={isLoading}
              aria-label="카카오 로그인"
              className="flex h-[52px] w-full items-center justify-center gap-2 rounded-full text-[15px] font-medium transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              style={{ backgroundColor: '#FEE500', color: '#000000D9' }}
            >
              {isKakaoLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#00000040] border-t-[#000000D9]" />
              ) : (
                <KakaoSymbol />
              )}
              {isKakaoLoading ? '로그인 중...' : '카카오 로그인'}
            </button>

            {/* 네이버 로그인 */}
            <button
              type="button"
              onClick={handleNaverLogin}
              disabled={isLoading}
              aria-label="네이버 로그인"
              className="flex h-[52px] w-full items-center justify-center gap-2 rounded-full text-[15px] font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              style={{ backgroundColor: '#03C75A' }}
            >
              {isNaverLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              ) : (
                <NaverSymbol />
              )}
              {isNaverLoading ? '로그인 중...' : '네이버 로그인'}
            </button>

            {/* 안내 텍스트 — 네이버 로그인과 회원가입 사이 */}
            <p
              className="whitespace-nowrap pt-2 text-center text-gray-400"
              style={{ fontSize: '12px' }}
            >
              SSAC 계정이 없으신가요? 지금 바로 만들어보세요:
            </p>

            {/* 회원가입 */}
            <Link
              href="/signup"
              className="flex h-[52px] w-full items-center justify-center rounded-full border border-black text-[15px] font-medium text-black transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              회원가입
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function KakaoSymbol() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9 1.5C4.85786 1.5 1.5 4.21634 1.5 7.57143C1.5 9.65169 2.74364 11.4989 4.66071 12.6027L3.80357 15.8036C3.73036 16.0714 4.03393 16.2857 4.26786 16.1339L8.08036 13.6875C8.38393 13.7143 8.6875 13.7143 9 13.7143C13.1421 13.7143 16.5 11 16.5 7.57143C16.5 4.21634 13.1421 1.5 9 1.5Z"
        fill="#1A1A1A"
      />
    </svg>
  );
}

function NaverSymbol() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M10.18 9.31L7.62 5.4H5.4V12.6H7.82V8.69L10.38 12.6H12.6V5.4H10.18V9.31Z"
        fill="white"
      />
    </svg>
  );
}
