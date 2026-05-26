'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { DOMAIN_TABS } from '@/constants/domains';
import type { DomainTabKey } from './constants';

interface ContentsPanelProps {
  onClose: () => void;
}

export function ContentsPanel({ onClose }: ContentsPanelProps) {
  const router = useRouter();
  const [activeDomain, setActiveDomain] = useState<DomainTabKey>('realestate');

  const activeTab = DOMAIN_TABS.find((t) => t.key === activeDomain)!;

  const handleViewAll = () => {
    router.push(activeTab.route);
    onClose();
  };

  return (
    <div className="px-8 py-6">
      {/* 도메인 탭 — rounded pill 버튼 */}
      <div className="mb-6 flex flex-wrap gap-2" role="tablist" aria-label="콘텐츠 도메인">
        {DOMAIN_TABS.map((tab) => {
          const isActive = activeDomain === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveDomain(tab.key as DomainTabKey)}
              className={cn(
                'rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400',
                isActive
                  ? 'border-2 border-gray-900 bg-white text-gray-900 font-semibold'
                  : 'border border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50',
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 구분선 */}
      <hr className="mb-4 border-gray-200" />

      {/* 전체 보기 영역 */}
      <div role="tabpanel" aria-label={`${activeTab.label} 콘텐츠`} className="min-h-[120px]">
        <p className="mb-3 text-sm font-semibold text-gray-900">
          {activeTab.label} 콘텐츠를 한 곳에서
        </p>

        <button
          type="button"
          onClick={handleViewAll}
          className="text-sm font-medium text-gray-900 underline-offset-2 hover:underline"
        >
          {activeTab.label} 전체
        </button>

        {/* 추후 세부 콘텐츠 추가 예정 */}
        <p className="mt-6 text-sm text-gray-400">(추후 세부 콘텐츠 추가 예정)</p>
      </div>
    </div>
  );
}
