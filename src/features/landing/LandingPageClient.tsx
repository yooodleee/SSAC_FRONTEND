'use client';

/**
 * LandingPageClient — 브랜딩 랜딩 홈 클라이언트 컴포넌트
 *
 * - authCode 파라미터 감지: Kakao OAuth 브리지 (→ /auth/kakao/callback)
 * - 일반 진입: 브랜딩 랜딩 홈 4개 섹션 렌더링
 */

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LandingHeader } from '@/components/layout/LandingHeader';
import { HeroSection } from './HeroSection';
import { ContentGallery } from './ContentGallery';
import { NewsDomainScroller } from './NewsDomainScroller';
import { TechSection } from './TechSection';

function Spinner() {
  return (
    <div
      className="flex min-h-screen items-center justify-center"
      style={{ backgroundColor: '#1a1a1a' }}
    >
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
    </div>
  );
}

/**
 * Kakao OAuth 브리지:
 * BE의 Spring Security 성공 핸들러가 redirectTo='/' 설정으로 인해
 * authCode를 루트 경로(?authCode=...)로 보내는 경우를 처리한다.
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

interface LandingPageClientProps {
  isLoggedIn: boolean;
}

export function LandingPageClient({ isLoggedIn }: LandingPageClientProps) {
  const searchParams = useSearchParams();
  const authCode = searchParams.get('authCode');

  // Kakao OAuth authCode 브리지
  if (authCode) {
    return <KakaoAuthCodeBridge authCode={authCode} />;
  }

  // 브랜딩 랜딩 홈
  return (
    <>
      {/* 랜딩 전용 헤더 (fixed, 2행 구조, 스크롤 기반 색상 전환) */}
      <LandingHeader isLoggedIn={isLoggedIn} />

      {/* 섹션 1: 브랜딩 히어로 */}
      <HeroSection isLoggedIn={isLoggedIn} />

      {/* 섹션 2: 콘텐츠 갤러리 */}
      <ContentGallery />

      {/* 섹션 3: 금융 도메인 뉴스 가로 스크롤 */}
      <NewsDomainScroller />

      {/* 섹션 4: TECH (Coming Soon) */}
      <TechSection />
    </>
  );
}
