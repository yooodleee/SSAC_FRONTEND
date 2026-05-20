'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { DOMAIN_TABS } from './constants';
import type { DomainTabId } from './constants';

interface ContentsPanelProps {
  onClose: () => void;
}

export function ContentsPanel({ onClose: _onClose }: ContentsPanelProps) {
  const [activeDomain, setActiveDomain] = useState<DomainTabId>('realestate');

  return (
    <div className="px-8 py-6">
      <h2 className="mb-6 text-xl font-bold text-gray-900">모든 콘텐츠</h2>

      {/* 도메인 탭 — rounded pill 버튼 */}
      <div className="mb-6 flex flex-wrap gap-2" role="tablist" aria-label="콘텐츠 도메인">
        {DOMAIN_TABS.map((tab) => {
          const isActive = activeDomain === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveDomain(tab.id)}
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

      {/* 세부 콘텐츠 영역 — 추후 스프린트에서 추가 예정 */}
      <div
        className="min-h-[120px] rounded-lg border border-dashed border-gray-200 p-6"
        role="tabpanel"
        aria-label={`${DOMAIN_TABS.find((t) => t.id === activeDomain)?.label ?? ''} 콘텐츠`}
      >
        <p className="text-sm text-gray-400">
          이 영역은 추후 스프린트에서 콘텐츠가 추가될 예정입니다.
        </p>
      </div>
    </div>
  );
}
