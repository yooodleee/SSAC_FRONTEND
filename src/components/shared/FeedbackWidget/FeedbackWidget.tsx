'use client';

/**
 * FeedbackWidget — 개발팀 문의 플로팅 버튼 + 패널
 *
 * 적용 페이지: / (브랜딩 랜딩 홈)
 *
 * 동작:
 *   - 플로팅 버튼 클릭 → 패널 토글
 *   - 패널 닫기: X 버튼 / ESC 키 / 외부 클릭
 *   - 닫힐 때 입력 내용 유지 (재오픈 시 복원)
 *   - 전송 성공 시에만 입력란 초기화
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

// ── SVG 아이콘 ────────────────────────────────────────────────────────────────

function MessageIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-6 w-6"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-4 w-4"
    >
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-4 w-4"
    >
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

// ── FeedbackWidget ────────────────────────────────────────────────────────────

export function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [panelMounted, setPanelMounted] = useState(false);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const widgetRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pathname = usePathname();

  const prefersReducedMotion =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  // 패널 enter 애니메이션 — cleanup에서 reset해 다음 열림을 위해 준비
  useEffect(() => {
    if (!isOpen) return;
    const raf = requestAnimationFrame(() => setPanelMounted(true));
    return () => {
      cancelAnimationFrame(raf);
      setPanelMounted(false);
    };
  }, [isOpen]);

  // 패널 열릴 때 textarea 포커스
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => textareaRef.current?.focus(), 50);
    return () => clearTimeout(timer);
  }, [isOpen]);

  // ESC 키
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // 외부 클릭
  useEffect(() => {
    if (!isOpen) return;
    const handleMouseDown = (e: MouseEvent) => {
      if (widgetRef.current && !widgetRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [isOpen]);

  const handleSubmit = useCallback(async () => {
    if (!message.trim() || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message.trim(),
          pageUrl: pathname,
        }),
      });
      if (!res.ok) throw new Error();
      setMessage(''); // 전송 성공 시에만 초기화
    } catch {
      setError('전송에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  }, [message, isSubmitting, pathname]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div ref={widgetRef} className="fixed bottom-6 right-4 z-[1000] md:bottom-8 md:right-8">
      {/* ── 피드백 패널 ── */}
      {isOpen && (
        <div
          id="feedback-panel"
          role="dialog"
          aria-label="개발팀 문의"
          aria-modal="true"
          className="absolute bottom-[calc(100%+12px)] right-0 w-[calc(100vw-32px)] overflow-hidden rounded-2xl bg-white shadow-[0_8px_32px_rgba(0,0,0,0.16)] sm:w-[360px]"
          style={{
            transition: prefersReducedMotion ? 'none' : 'opacity 250ms ease, transform 250ms ease',
            opacity: panelMounted ? 1 : 0,
            transform: panelMounted ? 'translateY(0)' : 'translateY(8px)',
          }}
        >
          {/* 헤더 */}
          <div className="flex items-center justify-between bg-[#1B4332] px-4 py-3">
            <span className="text-base font-semibold text-white">개발팀 문의</span>
            <button
              type="button"
              aria-label="문의 창 닫기"
              onClick={() => setIsOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            >
              <XIcon />
            </button>
          </div>

          {/* 본문 */}
          <div className="flex flex-col items-center px-6 py-8">
            <Image
              src="/gress.png"
              alt="SSAC"
              width={80}
              height={80}
              className="mb-4 object-contain"
            />
            <p className="text-[13px] text-gray-900">무엇을 도와드릴까요?</p>
          </div>

          {/* 입력 영역 */}
          <div className="border-t border-gray-100">
            {error && <p className="px-4 pt-3 text-xs text-red-500">{error}</p>}
            <div className="flex items-center gap-2 px-3 py-3">
              <textarea
                ref={textareaRef}
                rows={1}
                placeholder="피드백 공유하거나 질문하기"
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  setError(null);
                }}
                onKeyDown={handleKeyDown}
                className="flex-1 resize-none rounded-lg bg-white py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none ring-1 ring-transparent transition-shadow focus:ring-2 focus:ring-[#1B4332]/40"
              />
              <button
                type="button"
                aria-label="피드백 전송"
                onClick={handleSubmit}
                disabled={!message.trim() || isSubmitting}
                style={
                  !message.trim() || isSubmitting
                    ? { opacity: 0.4, cursor: 'not-allowed', pointerEvents: 'none' }
                    : undefined
                }
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1B4332] text-white transition-colors hover:bg-[#145229] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4332]/50"
              >
                <SendIcon />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 플로팅 버튼 ── */}
      <button
        type="button"
        aria-label="개발팀에 문의하기"
        aria-expanded={isOpen}
        aria-controls="feedback-panel"
        onClick={() => setIsOpen((v) => !v)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#1B4332] text-white shadow-[0_4px_16px_rgba(0,0,0,0.2)] transition-all duration-200 hover:scale-105 hover:bg-[#145229] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4332]/50 focus-visible:ring-offset-2"
      >
        <MessageIcon />
      </button>
    </div>
  );
}
