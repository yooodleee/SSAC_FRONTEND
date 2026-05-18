'use client';

/**
 * NewsDomainScroller — 세 번째 섹션: 금융 도메인별 뉴스 카드 가로 스크롤
 *
 * - 7개 금융 도메인 카드 가로 스크롤
 * - snap-scroll: 카드 단위 이동
 * - 커스텀 스크롤바 (하단 표시)
 * - 모바일: 터치 스와이프 + 스냅 스크롤
 * - 카드 클릭 → /news?category={domain}
 * - hover: 이미지 오버레이 + 텍스트 강조
 * - Intersection Observer 기반 fade-in
 * - prefers-reduced-motion 대응
 */

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const DOMAINS = [
  {
    label: '부동산/자취',
    category: 'realestate',
    imgSrc: '/domains/부동산_자취_카드_뉴스.png',
    textColor: '#ffffff',
  },
  {
    label: '세금/연말정산',
    category: 'tax',
    imgSrc: '/domains/세금_연말정산_카드_뉴스.png',
    textColor: '#ffffff',
  },
  {
    label: '재테크/신용',
    category: 'finance',
    imgSrc: '/domains/재테크_신용_카드_뉴스.png',
    textColor: '#ffffff',
  },
  {
    label: '근로/급여',
    category: 'work',
    imgSrc: '/domains/근로_급여_카드_뉴스.png',
    textColor: '#ffffff',
  },
  {
    label: '학자금/장학금',
    category: 'scholarship',
    imgSrc: '/domains/학자금_장학금_카드_뉴스.png',
    textColor: '#ffffff',
  },
  {
    label: '사회보험/복지',
    category: 'welfare',
    imgSrc: '/domains/사회보험_복지_카드_뉴스.png',
    textColor: '#ffffff',
  },
  {
    label: '소비/예산관리',
    category: 'budget',
    imgSrc: '/domains/소비_예산관리_카드_뉴스.png',
    textColor: '#ffffff',
  },
] as const;

export function NewsDomainScroller() {
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, scrollLeft: 0 });

  // Intersection Observer — 섹션 진입 시 fade-in
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // 마우스 드래그 스크롤
  const handleMouseDown = (e: React.MouseEvent) => {
    const el = scrollRef.current;
    if (!el) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.pageX - el.offsetLeft, scrollLeft: el.scrollLeft };
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const el = scrollRef.current;
    if (!el) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = (x - dragStartRef.current.x) * 1.5;
    el.scrollLeft = dragStartRef.current.scrollLeft - walk;
  };
  const stopDrag = () => setIsDragging(false);

  return (
    <section
      ref={sectionRef}
      aria-label="금융 도메인별 최신 뉴스"
      className={cn(
        'overflow-hidden bg-gray-50 py-16 motion-reduce:transition-none motion-reduce:translate-y-0 motion-reduce:opacity-100',
        'transition-all duration-700',
        visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0',
      )}
    >
      {/* 섹션 제목 */}
      <div className="mx-auto mb-6 max-w-6xl px-4 sm:px-6">
        <h2 className="font-bold text-[#1A1A1A]" style={{ fontSize: '22px', lineHeight: '1.3' }}>
          금융 도메인별 최신 뉴스
        </h2>
      </div>

      {/* 가로 스크롤 — max-w-6xl 컨테이너에서 시작, 우측은 뷰포트까지 확장 */}
      <div className="mx-auto max-w-6xl">
        <div
          ref={scrollRef}
          role="list"
          aria-label="금융 도메인 카드 목록"
          className={cn(
            'flex gap-4 overflow-x-auto pb-4',
            '-mr-4 pr-4 sm:-mr-6 sm:pr-6',
            'pl-4 sm:pl-6',
            isDragging ? 'cursor-grabbing' : 'cursor-grab',
            // 커스텀 스크롤바
            '[&::-webkit-scrollbar]:h-1.5',
            '[&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-200',
            '[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-400 [&::-webkit-scrollbar-thumb]:hover:bg-gray-500',
          )}
          style={{
            scrollSnapType: 'x mandatory',
            scrollbarWidth: 'thin',
            scrollbarColor: '#9ca3af #e5e7eb',
            WebkitOverflowScrolling: 'touch',
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={stopDrag}
          onMouseLeave={stopDrag}
        >
          {DOMAINS.map((domain, i) => (
            <a
              key={domain.category}
              href={`/news?category=${domain.category}`}
              role="listitem"
              aria-label={`${domain.label} 뉴스 보기`}
              className="group relative flex-shrink-0 overflow-hidden rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              style={{
                width: '200px',
                height: '160px',
                scrollSnapAlign: 'start',
                backgroundColor: '#1a1a1a',
                transition: 'opacity 500ms ease, transform 500ms ease, box-shadow 300ms ease',
                transitionDelay: `${i * 80}ms`,
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(20px)',
              }}
              draggable={false}
            >
              {/* 도메인 대표 사진 — lazy loading */}
              <Image
                src={domain.imgSrc}
                alt={domain.label}
                fill
                sizes="200px"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />

              {/* hover 오버레이 */}
              <div
                className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{ background: 'rgba(0,0,0,0.25)' }}
                aria-hidden="true"
              />

              {/* 도메인 텍스트 — 우측 하단 */}
              <div className="absolute bottom-0 right-0 left-0 bg-gradient-to-t from-black/60 to-transparent px-3 pb-3 pt-6">
                <p
                  className="text-right text-sm font-bold drop-shadow"
                  style={{ color: domain.textColor }}
                >
                  {domain.label}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
