'use client';

import { useState } from 'react';

const DOMAINS = [
  '부동산/자취',
  '세금/연말정산',
  '재테크/신용',
  '근로/급여',
  '학자금/장학금',
  '사회보험/복지',
  '소비/예산관리',
] as const;

interface PublishModalProps {
  onClose: () => void;
  onPublish: (domains: string[]) => Promise<void>;
}

export function PublishModal({ onClose, onPublish }: PublishModalProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const toggle = (domain: string) => {
    setSelected((prev) =>
      prev.includes(domain) ? prev.filter((d) => d !== domain) : [...prev, domain],
    );
  };

  const handlePublish = async () => {
    if (!selected.length) return;
    setSubmitting(true);
    try {
      await onPublish(selected);
    } finally {
      setSubmitting(false);
    }
  };

  const canPublish = selected.length > 0 && !submitting;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#1A1A1A]">게시 설정</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="닫기"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M1 1L13 13M13 1L1 13"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <p className="mb-4 text-sm text-[#6B6B6B]">게시할 금융 도메인을 선택해주세요</p>

        {/* Domain list */}
        <ul className="mb-6 space-y-2">
          {DOMAINS.map((domain) => (
            <li key={domain}>
              <label className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-[#F5F5F5]">
                <input
                  type="checkbox"
                  checked={selected.includes(domain)}
                  onChange={() => toggle(domain)}
                  className="h-4 w-4 rounded accent-[#1B4332]"
                />
                <span className="text-sm text-[#1A1A1A]">{domain}</span>
              </label>
            </li>
          ))}
        </ul>

        {/* Buttons */}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[#E8E8E8] px-4 py-2 text-sm text-[#6B6B6B] hover:bg-[#F5F5F5]"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handlePublish}
            disabled={!canPublish}
            className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-opacity"
            style={{
              backgroundColor: '#1B4332',
              opacity: canPublish ? 1 : 0.4,
              cursor: canPublish ? 'pointer' : 'not-allowed',
              pointerEvents: canPublish ? 'auto' : 'none',
            }}
          >
            {submitting ? '게시 중...' : '게시'}
          </button>
        </div>
      </div>
    </div>
  );
}
