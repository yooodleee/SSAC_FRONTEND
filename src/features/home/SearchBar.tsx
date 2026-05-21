'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { searchService } from '@/services/search';
import type { SearchSuggestion } from '@/types';

const MAX_LENGTH = 50;

export function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isSuggestOpen, setIsSuggestOpen] = useState(false);
  const [activeSuggestionIdx, setActiveSuggestionIdx] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsSuggestOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 디바운스 자동완성 요청 (query가 비어있지 않을 때만 동작)
  useEffect(() => {
    if (query.length === 0) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      const result = await searchService.suggest(query);
      setSuggestions(result);
      setIsSuggestOpen(result.length > 0);
      setActiveSuggestionIdx(-1);
    }, 200);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const executeSearch = useCallback(
    (keyword: string) => {
      const trimmed = keyword.trim();
      if (!trimmed) return;
      setIsSuggestOpen(false);
      searchService.logSearch(trimmed);
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    },
    [router],
  );

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!isSuggestOpen) {
      if (e.key === 'Enter') executeSearch(query);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestionIdx((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestionIdx((prev) => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeSuggestionIdx >= 0) {
        const selected = suggestions[activeSuggestionIdx]?.keyword ?? '';
        setQuery(selected);
        executeSearch(selected);
      } else {
        executeSearch(query);
      }
    } else if (e.key === 'Escape') {
      setIsSuggestOpen(false);
      setActiveSuggestionIdx(-1);
    }
  }

  function handleSuggestionClick(keyword: string) {
    setQuery(keyword);
    executeSearch(keyword);
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="flex items-center overflow-hidden rounded-xl border border-gray-300 bg-white shadow-sm focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 dark:border-slate-600 dark:bg-slate-800 dark:focus-within:border-blue-500 dark:focus-within:ring-blue-900">
        {/* 검색 아이콘 */}
        <span className="pl-4 text-gray-400 dark:text-slate-500" aria-hidden="true">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
            />
          </svg>
        </span>

        <input
          type="search"
          role="combobox"
          value={query}
          onChange={(e) => {
            const next = e.target.value.slice(0, MAX_LENGTH);
            setQuery(next);
            if (next.length === 0) {
              setSuggestions([]);
              setIsSuggestOpen(false);
            }
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setIsSuggestOpen(true)}
          placeholder="금융 콘텐츠를 검색하세요"
          maxLength={MAX_LENGTH}
          aria-label="금융 콘텐츠 검색"
          aria-autocomplete="list"
          aria-expanded={isSuggestOpen}
          aria-haspopup="listbox"
          aria-controls="search-suggest-listbox"
          className="flex-1 bg-transparent px-3 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none dark:text-slate-100 dark:placeholder-slate-500"
        />

        {/* 글자 수 */}
        {query.length > 0 && (
          <span className="pr-2 text-xs text-gray-400 dark:text-slate-500">
            {query.length}/{MAX_LENGTH}
          </span>
        )}

        {/* 검색 버튼 */}
        <button
          type="button"
          onClick={() => executeSearch(query)}
          className="m-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
          aria-label="검색"
        >
          검색
        </button>
      </div>

      {/* 자동완성 드롭다운 */}
      {isSuggestOpen && suggestions.length > 0 && (
        <ul
          id="search-suggest-listbox"
          role="listbox"
          aria-label="추천 검색어"
          className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800"
        >
          {suggestions.map((s, i) => (
            <li
              key={s.keyword}
              role="option"
              aria-selected={i === activeSuggestionIdx}
              onMouseDown={() => handleSuggestionClick(s.keyword ?? '')}
              onMouseEnter={() => setActiveSuggestionIdx(i)}
              className={`flex cursor-pointer items-center gap-2 px-4 py-2.5 text-sm transition-colors ${
                i === activeSuggestionIdx
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'text-gray-700 hover:bg-gray-50 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3.5 w-3.5 flex-shrink-0 text-gray-400 dark:text-slate-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
                />
              </svg>
              <span>{s.keyword}</span>
              {(s.popularity ?? 0) > 0 && (
                <span className="ml-auto text-xs text-gray-400 dark:text-slate-500">
                  {s.popularity}회
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
