'use client';

import { useState, useEffect } from 'react';

type FeedbackStatus = 'PENDING' | 'IN_PROGRESS' | 'DONE';

interface FeedbackItem {
  id: number;
  status: FeedbackStatus;
  message: string;
  maskedNickname: string;
  pageUrl: string | null;
  createdAt: string;
}

const STATUS_LABELS: Record<FeedbackStatus, string> = {
  PENDING: '대기',
  IN_PROGRESS: '처리 중',
  DONE: '완료',
};

const STATUS_COLORS: Record<FeedbackStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  DONE: 'bg-green-100 text-green-700',
};

const FILTER_TABS: Array<{ label: string; value: FeedbackStatus | 'ALL' }> = [
  { label: '전체', value: 'ALL' },
  { label: '대기', value: 'PENDING' },
  { label: '처리 중', value: 'IN_PROGRESS' },
  { label: '완료', value: 'DONE' },
];

function SkeletonRow() {
  return (
    <tr className="border-b border-[#F5F5F5]">
      {[1, 2, 3, 4, 5].map((i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 animate-pulse rounded bg-gray-100" />
        </td>
      ))}
    </tr>
  );
}

export function FeedbackList() {
  const [filter, setFilter] = useState<FeedbackStatus | 'ALL'>('ALL');
  const [page, setPage] = useState(1);
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const PAGE_SIZE = 20;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE) || 1;

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams({ page: String(page), size: String(PAGE_SIZE) });
    if (filter !== 'ALL') params.set('status', filter);
    const url = `/api/v1/admin/feedbacks?${params.toString()}`;

    const raf = requestAnimationFrame(() => {
      if (cancelled) return;
      setIsLoading(true);
      fetch(url)
        .then((r) => r.json())
        .then((data: { totalCount?: number; feedbacks?: FeedbackItem[] }) => {
          if (cancelled) return;
          setFeedbacks(data.feedbacks ?? []);
          setTotalCount(data.totalCount ?? 0);
        })
        .catch(() => {})
        .finally(() => {
          if (!cancelled) setIsLoading(false);
        });
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [filter, page]);

  async function handleStatusChange(id: number, status: FeedbackStatus) {
    setUpdatingId(id);
    try {
      await fetch(`/api/v1/admin/feedbacks/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      setFeedbacks((prev) => prev.map((f) => (f.id === id ? { ...f, status } : f)));
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* 필터 탭 */}
      <div className="flex gap-2">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => {
              setFilter(tab.value);
              setPage(1);
            }}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4332] ${
              filter === tab.value
                ? 'bg-[#1B4332] text-white'
                : 'border border-[#E8E8E8] bg-white text-[#6B6B6B] hover:border-[#1B4332] hover:text-[#1B4332]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 테이블 */}
      <div className="overflow-x-auto rounded-xl border border-[#E8E8E8] bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E8E8E8] bg-[#FAFAFA] text-left text-xs text-gray-500">
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">닉네임</th>
              <th className="px-4 py-3 font-medium w-[40%]">내용</th>
              <th className="px-4 py-3 font-medium">페이지</th>
              <th className="px-4 py-3 font-medium">상태</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
            ) : feedbacks.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-400">
                  피드백이 없습니다.
                </td>
              </tr>
            ) : (
              feedbacks.map((item) => (
                <tr key={item.id} className="border-b border-[#F5F5F5] hover:bg-[#FAFAFA]">
                  <td className="px-4 py-3 text-gray-400">{item.id}</td>
                  <td className="px-4 py-3 text-gray-700">{item.maskedNickname}</td>
                  <td className="px-4 py-3 text-gray-800">{item.message}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs truncate max-w-[120px]">
                    {item.pageUrl ?? '-'}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={item.status}
                      disabled={updatingId === item.id}
                      onChange={(e) =>
                        void handleStatusChange(item.id, e.target.value as FeedbackStatus)
                      }
                      className={`rounded-full px-2.5 py-1 text-xs font-medium focus:outline-none disabled:opacity-60 ${STATUS_COLORS[item.status]}`}
                    >
                      {(Object.keys(STATUS_LABELS) as FeedbackStatus[]).map((s) => (
                        <option key={s} value={s}>
                          {STATUS_LABELS[s]}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E8E8E8] text-gray-500 transition-colors hover:border-[#1B4332] hover:text-[#1B4332] disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4332]"
            aria-label="이전 페이지"
          >
            ‹
          </button>
          <span className="text-sm text-gray-500">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E8E8E8] text-gray-500 transition-colors hover:border-[#1B4332] hover:text-[#1B4332] disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4332]"
            aria-label="다음 페이지"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}
