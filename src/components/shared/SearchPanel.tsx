'use client';

/**
 * SearchPanel — 전역 검색 패널
 *
 * 상태:
 *   1. 미포커스: 검색어 순환 placeholder (2.5초 fade 전환)
 *   2. 포커스 + 미입력: 빈 상태 메시지
 *   3. 포커스 + 입력 중: 자동완성 패널 (300ms 디바운스, 가나다 정렬)
 *
 * 데스크탑: 드롭다운 패널 + 하단 오버레이
 * 모바일: 전체 화면 오버레이
 */

import { useState, useEffect, useRef, useCallback, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import { useSearchService } from '@/hooks/useSearchService';
import type { SuggestionItem } from '@/types';

const PLACEHOLDER_KEYWORDS = ['연말정산', '전세 계약', '신용점수', '퇴직연금', '재테크', '금리'];
// Row1 h-14(56px) + border(1px) + Row2 tabs py-1.5+text-xs(28px) = 85px
const NAV_HEIGHT = 85;

// 검색어 일치 부분 굵게
function HighlightedText({ text, query }: { text: string; query: string }) {
  if (!query || !text) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <strong className="font-bold">{text.slice(idx, idx + query.length)}</strong>
      {text.slice(idx + query.length)}
    </>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className ?? 'h-4 w-4'}
    >
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className ?? 'h-3.5 w-3.5'}
    >
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

interface PanelContentProps {
  query: string;
  suggestions: SuggestionItem[];
  isLoading: boolean;
  onSelect: (keyword: string) => void;
}

function PanelContent({ query, suggestions, isLoading, onSelect }: PanelContentProps) {
  if (!query) {
    return (
      <div className="px-5 py-4">
        <p className="text-sm text-gray-400">
          아직 등록된 콘텐츠가 없습니다. 곧 업데이트될 예정입니다.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-200 border-t-[#4CAF82]" />
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
      <div className="px-5 py-4">
        <p className="text-sm text-gray-500">&lsquo;{query}&rsquo;에 대한 결과가 없습니다.</p>
      </div>
    );
  }

  return (
    <ul role="listbox" aria-label="자동완성 검색어">
      {suggestions.map((s) => (
        <li
          key={s.id ?? s.keyword}
          role="option"
          aria-selected={false}
          onMouseDown={(e) => {
            e.preventDefault(); // blur 방지
            onSelect(s.keyword ?? '');
          }}
          className="flex cursor-pointer items-center gap-3 px-5 py-3 text-sm text-gray-700 transition-colors hover:bg-gray-50"
        >
          {s.categoryEmoji && (
            <span aria-hidden="true" className="shrink-0 text-base">
              {s.categoryEmoji}
            </span>
          )}
          {!s.categoryEmoji && <SearchIcon className="h-3.5 w-3.5 shrink-0 text-gray-300" />}
          <span>
            <HighlightedText text={s.keyword ?? ''} query={query} />
          </span>
          {s.category && <span className="ml-auto text-xs text-gray-300">{s.category}</span>}
        </li>
      ))}
    </ul>
  );
}

interface SearchPanelProps {
  isOpen?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
}

export function SearchPanel({
  isOpen: controlledOpen,
  onOpen,
  onClose: externalOnClose,
}: SearchPanelProps = {}) {
  const router = useRouter();
  const { suggest, logSearch } = useSearchService();

  const [isOpenInternal, setIsOpenInternal] = useState(false);
  const isOpen = controlledOpen !== undefined ? controlledOpen : isOpenInternal;

  // SSR-safe 마운트 감지 (useEffect + setState 대신 useSyncExternalStore 사용)
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const [query, setQuery] = useState('');
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [placeholderVisible, setPlaceholderVisible] = useState(true);
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // 순환 placeholder (미입력 상태에서만)
  useEffect(() => {
    if (query) return;
    const id = setInterval(() => {
      setPlaceholderVisible(false);
      setTimeout(() => {
        setPlaceholderIdx((prev) => (prev + 1) % PLACEHOLDER_KEYWORDS.length);
        setPlaceholderVisible(true);
      }, 200);
    }, 2500);
    return () => clearInterval(id);
  }, [query]);

  // 자동완성 (300ms 디바운스)
  // setState는 모두 setTimeout 콜백 안에서 호출 (effect 바디 직접 호출 금지)
  useEffect(() => {
    if (!query) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const result = await suggest(query);
        const sorted = [...result].sort((a, b) =>
          (a.keyword ?? '').localeCompare(b.keyword ?? '', 'ko'),
        );
        setSuggestions(sorted);
      } catch {
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, suggest]);

  // handleClose는 ESC useEffect보다 반드시 먼저 선언
  const handleClose = useCallback(() => {
    setIsOpenInternal(false);
    externalOnClose?.();
    setQuery('');
    setSuggestions([]);
    setIsLoading(false);
  }, [externalOnClose]);

  // ESC 닫기
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, handleClose]);

  const executeSearch = useCallback(
    (keyword: string) => {
      const trimmed = keyword.trim();
      if (!trimmed) return;
      handleClose();
      logSearch(trimmed);
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    },
    [handleClose, logSearch, router],
  );

  const clearQuery = () => {
    setQuery('');
    setSuggestions([]);
    setIsLoading(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') executeSearch(query);
  };

  const hasQuery = query.length > 0;

  return (
    <>
      {/* 데스크탑 검색 입력란 */}
      <div
        className={`relative w-full${isOpen && !isMobile ? ' rounded-t-2xl border-t border-x border-white/20' : ''}`}
      >
        {/* 검색 아이콘 (미입력 시) */}
        {!hasQuery && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 z-10">
            <SearchIcon className="h-4 w-4 text-white/50" />
          </span>
        )}

        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            setIsOpenInternal(true);
            onOpen?.();
          }}
          onKeyDown={handleKeyDown}
          placeholder=""
          aria-label="콘텐츠 검색"
          aria-haspopup="listbox"
          className={`w-full bg-white/10 py-2.5 text-sm text-white outline-none transition-colors focus:bg-white/20 [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden ${isOpen && !isMobile ? 'rounded-t-2xl rounded-b-none' : 'rounded-full'} ${hasQuery ? 'pl-4 pr-9' : 'pl-9 pr-4'}`}
        />

        {/* 순환 placeholder (미입력 + 미포커스) */}
        {!hasQuery && !isOpen && (
          <span
            aria-hidden="true"
            className={`pointer-events-none absolute left-9 top-1/2 -translate-y-1/2 select-none text-sm text-white/50 transition-opacity duration-200 ${placeholderVisible ? 'opacity-100' : 'opacity-0'}`}
          >
            {PLACEHOLDER_KEYWORDS[placeholderIdx]}
          </span>
        )}

        {/* X 버튼 (입력 중) */}
        {hasQuery && (
          <button
            type="button"
            aria-label="검색어 지우기"
            onClick={clearQuery}
            className="absolute right-3 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-white/80 transition-colors hover:bg-white/30 focus-visible:outline-none"
          >
            <XIcon className="h-3 w-3" />
          </button>
        )}

        {/* 데스크탑 드롭다운 패널 */}
        {isOpen && !isMobile && (
          <div
            role="dialog"
            aria-label="검색 패널"
            className="absolute left-0 right-0 top-full z-[1000] overflow-y-auto rounded-b-2xl bg-white"
            style={{
              maxHeight: '400px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
            }}
          >
            <PanelContent
              query={query}
              suggestions={suggestions}
              isLoading={isLoading}
              onSelect={executeSearch}
            />
          </div>
        )}
      </div>

      {/* 데스크탑 오버레이 */}
      {mounted &&
        isOpen &&
        !isMobile &&
        createPortal(
          <div
            aria-hidden="true"
            className="fixed left-0 right-0 bottom-0 z-[49] bg-black/40 transition-opacity duration-200"
            style={{ top: `${NAV_HEIGHT}px` }}
            onClick={handleClose}
          />,
          document.body,
        )}

      {/* 모바일 전체 화면 오버레이 */}
      {mounted &&
        isOpen &&
        isMobile &&
        createPortal(
          <div className="fixed inset-0 z-[60] flex flex-col bg-white">
            {/* 상단 입력란 */}
            <div className="flex items-center gap-3 border-b border-[#E8E8E8] px-4 py-3">
              {!hasQuery && <SearchIcon className="h-4 w-4 shrink-0 text-gray-400" />}
              <input
                ref={mobileInputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={PLACEHOLDER_KEYWORDS[placeholderIdx]}
                aria-label="콘텐츠 검색"
                autoFocus
                className="flex-1 bg-transparent text-sm text-[#1A1A1A] outline-none placeholder:text-gray-400 [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
              />
              {hasQuery && (
                <button
                  type="button"
                  aria-label="검색어 지우기"
                  onClick={() => setQuery('')}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-gray-500"
                >
                  <XIcon className="h-3 w-3" />
                </button>
              )}
              <button
                type="button"
                onClick={handleClose}
                className="shrink-0 text-sm font-medium text-[#4CAF82]"
              >
                취소
              </button>
            </div>

            {/* 결과 목록 */}
            <div className="flex-1 overflow-y-auto bg-white">
              <PanelContent
                query={query}
                suggestions={suggestions}
                isLoading={isLoading}
                onSelect={executeSearch}
              />
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
