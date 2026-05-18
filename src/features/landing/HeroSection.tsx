'use client';

/**
 * HeroSection — 첫 번째 섹션: 브랜딩 히어로
 *
 * - 배경: /hero-bg.png (LCP 대상 priority 로딩, 로딩 전 #1a1a1a)
 * - 반투명 어두운 오버레이: rgba(0,0,0,0.45)
 * - 브랜딩 문구: 사진 높이의 1/3 아래 지점, 수평 중앙, 흰색
 * - CTA 버튼: "시작 하기 →" — 파란색 직사각형 (#1976D2)
 */

import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface HeroSectionProps {
  isLoggedIn: boolean;
}

export function HeroSection({ isLoggedIn }: HeroSectionProps) {
  const router = useRouter();

  const handleCTA = () => {
    router.push(isLoggedIn ? '/home' : '/login');
  };

  return (
    <section
      aria-label="SSAC 브랜딩 히어로"
      className="relative flex min-h-screen items-start justify-center overflow-hidden"
      style={{ backgroundColor: '#1a1a1a' }}
    >
      {/* 배경 이미지 — LCP 대상, priority 로딩 / 실패 시 #1a1a1a 대체 */}
      <div className="absolute inset-0" aria-hidden="true">
        <Image src="/hero-bg.png" alt="" fill priority sizes="100vw" className="object-cover" />
      </div>

      {/* 반투명 어두운 오버레이 */}
      <div
        className="absolute inset-0"
        aria-hidden="true"
        style={{ background: 'rgba(0, 0, 0, 0.45)' }}
      />

      {/* 브랜딩 콘텐츠 — 세로 높이 하단 1/3 지점 (약 60vh) */}
      <div
        className="relative z-10 flex flex-col items-center gap-6 px-4 text-center"
        style={{ marginTop: '58vh' }}
      >
        <h1
          className="text-white"
          style={{
            fontSize: 'clamp(24px, 4vw, 48px)',
            fontWeight: 700,
            lineHeight: 1.3,
            textShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}
        >
          금융 문맹 탈출의 첫 걸음,
          <br />
          어려운 금융 지식을 싹으로 쉽게
        </h1>

        {/* CTA 버튼 */}
        <button
          type="button"
          onClick={handleCTA}
          className="font-semibold text-white transition-all duration-300 ease-in-out hover:brightness-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
          style={{
            backgroundColor: '#1976D2',
            padding: '16px 32px',
            fontSize: '16px',
            borderRadius: '4px',
            minHeight: '52px',
            marginTop: '8px',
          }}
        >
          시작 하기 →
        </button>
      </div>
    </section>
  );
}
