import type { SearchResultResponse, SuggestionItem } from '@/types';

export const searchService = {
  async search(query: string): Promise<SearchResultResponse> {
    const res = await fetch(`/api/v1/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error('검색 요청에 실패했습니다.');
    const body = (await res.json()) as { data?: SearchResultResponse };
    return body.data ?? { query, totalCount: 0, results: [] };
  },

  async suggest(query: string): Promise<SuggestionItem[]> {
    const url = query
      ? `/api/v1/search/suggestions?q=${encodeURIComponent(query)}`
      : '/api/v1/search/suggestions';
    const res = await fetch(url);
    if (!res.ok) return [];
    const body = (await res.json()) as { data?: { suggestions?: SuggestionItem[] } };
    return body.data?.suggestions ?? [];
  },

  async logSearch(keyword: string): Promise<void> {
    await fetch('/api/search/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keyword }),
    }).catch(() => {
      // 로그 실패 무시
    });
  },
};
