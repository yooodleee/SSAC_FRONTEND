'use client';

import { useState, useCallback } from 'react';
import type { components } from '@/api-contract/generated/api-types';
import { formatRelativeTime } from '@/lib/utils';

type NewsItemResponse = components['schemas']['NewsItemResponse'];
type NewsListResponse = components['schemas']['NewsListResponse'];
type NewsSortType = 'latest' | 'popularity';

const SORT_LABELS: Record<NewsSortType, string> = {
  latest: '최신순',
  popularity: '인기순',
};

interface Props {
  initialItems: NewsItemResponse[];
  initialError?: boolean;
}

export function NewsSectionClient({ initialItems, initialError = false }: Props) {
  const [sort, setSort] = useState<NewsSortType>('latest');
  const [items, setItems] = useState<NewsItemResponse[]>(initialItems);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(initialError);

  const fetchNews = useCallback(async (sortType: NewsSortType) => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`/api/news?sort=${sortType}`);
      if (!res.ok) throw new Error();
      const data = (await res.json()) as NewsListResponse;
      setItems(data.contents ?? []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSortChange = (newSort: NewsSortType) => {
    if (newSort === sort) return;
    setSort(newSort);
    void fetchNews(newSort);
  };

  return (
    <section className="mb-12">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">금융 뉴스</h2>
        <SortTabs sort={sort} onChange={handleSortChange} />
      </div>

      {loading && <NewsListSkeleton />}

      {!loading && error && (
        <div className="rounded-xl border border-red-100 bg-red-50 p-6 text-center text-sm text-red-600">
          뉴스를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-10 text-center text-sm text-gray-500">
          표시할 뉴스가 없습니다.
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((item, idx) => (
            <NewsCard key={item.id ?? idx} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}

function SortTabs({ sort, onChange }: { sort: NewsSortType; onChange: (s: NewsSortType) => void }) {
  return (
    <div className="flex rounded-lg border border-gray-200 bg-gray-50 p-1">
      {(Object.keys(SORT_LABELS) as NewsSortType[]).map((key) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            sort === key ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
          aria-pressed={sort === key}
        >
          {SORT_LABELS[key]}
        </button>
      ))}
    </div>
  );
}

function NewsListSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-xl border border-gray-100 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="h-4 w-20 rounded bg-gray-200" />
            <div className="h-4 w-16 rounded bg-gray-200" />
          </div>
          <div className="mb-1 h-5 w-full rounded bg-gray-200" />
          <div className="mb-3 h-5 w-5/6 rounded bg-gray-200" />
          <div className="mb-1 h-4 w-full rounded bg-gray-200" />
          <div className="mb-1 h-4 w-full rounded bg-gray-200" />
          <div className="mb-3 h-4 w-2/3 rounded bg-gray-200" />
          <div className="h-3 w-24 rounded bg-gray-200" />
        </div>
      ))}
    </div>
  );
}

function NewsCard({ item }: { item: NewsItemResponse }) {
  return (
    <article className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between">
        <time dateTime={item.publishedAt} className="text-xs text-gray-400">
          {formatRelativeTime(item.publishedAt ?? '')}
        </time>
        {item.viewCount !== undefined && (
          <span className="text-xs text-gray-400">조회 {item.viewCount.toLocaleString()}</span>
        )}
      </div>
      <h3 className="line-clamp-2 font-semibold leading-snug text-gray-900">{item.title}</h3>
      <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-gray-500">{item.summary}</p>
    </article>
  );
}
