'use client';

import { useState, useEffect } from 'react';
import { ContentsPanel } from './ContentsPanel';
import { NewsPanel } from './NewsPanel';
import { TechPanel } from './TechPanel';
import { FaqPanel } from './FaqPanel';
import type { NavMenuId } from './constants';

const PANEL_LABELS: Record<NavMenuId, string> = {
  contents: '모든 콘텐츠 패널',
  news: '새로운 소식 패널',
  tech: 'TECH 패널',
  faq: 'FAQ 패널',
};

interface MegaMenuProps {
  activeTab: NavMenuId;
  onClose: () => void;
  /** 헤더 요소 ref — 헤더 내부 클릭 시 패널을 닫지 않기 위해 사용 */
  headerRef: React.RefObject<HTMLElement | null>;
}

export function MegaMenu({ activeTab, onClose, headerRef }: MegaMenuProps) {
  const [mounted, setMounted] = useState(false);

  // prefers-reduced-motion
  const prefersReducedMotion =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  // enter animation 트리거
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setMounted(true);
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  // ESC 키 핸들러
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // 스크롤 핸들러
  useEffect(() => {
    const handleScroll = () => onClose();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [onClose]);

  // 외부 클릭 핸들러 — header 내부 클릭은 무시 (탭 전환 시 닫힘 방지)
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (headerRef.current && headerRef.current.contains(e.target as Node)) return;
      onClose();
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [onClose, headerRef]);

  const panelLabel = PANEL_LABELS[activeTab];

  return (
    <div
      id="mega-menu-panel"
      role="region"
      aria-label={panelLabel}
      className="absolute left-0 top-full z-50 w-full bg-white shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
      style={{
        transition: prefersReducedMotion ? 'none' : 'opacity 200ms ease, transform 200ms ease',
        transformOrigin: 'top center',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(-8px)',
      }}
    >
      <div className="mx-auto max-w-6xl">
        {activeTab === 'contents' && <ContentsPanel onClose={onClose} />}
        {activeTab === 'news' && <NewsPanel onClose={onClose} />}
        {activeTab === 'tech' && <TechPanel onClose={onClose} />}
        {activeTab === 'faq' && <FaqPanel onClose={onClose} />}
      </div>
    </div>
  );
}
