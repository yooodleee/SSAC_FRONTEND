'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { TiptapEditor } from './TiptapEditor';
import { CategoryTag, CategoryPicker } from './CategoryTag';
import { PublishModal } from './PublishModal';
import { adminContentService } from '@/services/adminContent';
import { toastStore } from '@/lib/toastStore';
type ContentStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'DONE';
// UI-only type: UpdateContentRequest removed from BE contract
type UpdateContentRequest = { [key: string]: unknown };

const STATUS_OPTIONS: { value: ContentStatus; label: string; color: string }[] = [
  { value: 'NOT_STARTED', label: '시작 전', color: 'text-gray-500 bg-gray-100' },
  { value: 'IN_PROGRESS', label: '진행 중', color: 'text-blue-600 bg-blue-50' },
  { value: 'DONE', label: '완료', color: 'text-green-700 bg-green-50' },
];

function statusColor(s: ContentStatus) {
  return STATUS_OPTIONS.find((o) => o.value === s)?.color ?? 'text-gray-500 bg-gray-100';
}
function statusLabel(s: ContentStatus) {
  return STATUS_OPTIONS.find((o) => o.value === s)?.label ?? s;
}

// UI-only type: local draft state for the edit panel
interface PanelDraft {
  id: string;
  title: string;
  categories: string[];
  status: ContentStatus;
  isCompleted: boolean;
  body: string;
  thumbnailUrl: string;
  publishedAt?: string;
}

export interface PanelChanges {
  title?: string;
  categories?: string[];
  status?: ContentStatus;
  isCompleted?: boolean;
  thumbnailUrl?: string;
  publishedAt?: string;
}

interface ContentEditPanelProps {
  contentId: string;
  onClose: () => void;
  onUpdate: (id: string, changes: PanelChanges) => void;
}

export function ContentEditPanel({ contentId, onClose, onUpdate }: ContentEditPanelProps) {
  const [draft, setDraft] = useState<PanelDraft | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showStatusPicker, setShowStatusPicker] = useState(false);

  const categoryRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    const raf = requestAnimationFrame(() => {
      if (cancelled) return;
      setLoading(true);
      adminContentService
        .getContent(contentId)
        .then((data) => {
          if (cancelled) return;
          setDraft({
            id: contentId,
            title: data.title ?? '',
            categories: data.categories ?? [],
            status: (data.status as ContentStatus) ?? 'NOT_STARTED',
            isCompleted: data.isCompleted ?? false,
            body: data.body ?? '',
            thumbnailUrl: data.thumbnailUrl ?? '',
            publishedAt: data.publishedAt,
          });
        })
        .catch(() => {
          if (!cancelled) toastStore.show('콘텐츠를 불러오는 데 실패했습니다.');
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [contentId]);

  // Close pickers on outside click
  useEffect(() => {
    if (!showCategoryPicker && !showStatusPicker) return;
    const handle = (e: MouseEvent) => {
      if (
        showCategoryPicker &&
        categoryRef.current &&
        !categoryRef.current.contains(e.target as Node)
      ) {
        setShowCategoryPicker(false);
      }
      if (showStatusPicker && statusRef.current && !statusRef.current.contains(e.target as Node)) {
        setShowStatusPicker(false);
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [showCategoryPicker, showStatusPicker]);

  const updateDraft = useCallback(
    (changes: Partial<PanelDraft>) => {
      setDraft((prev) => (prev ? { ...prev, ...changes } : prev));
      onUpdate(contentId, changes);
    },
    [contentId, onUpdate],
  );

  const handleSave = useCallback(
    async (overrides?: Partial<PanelDraft>) => {
      if (!draft) return;
      const merged = { ...draft, ...overrides };
      try {
        await adminContentService.updateContent(contentId, {
          title: merged.title,
          categories: merged.categories,
          status: merged.status as UpdateContentRequest['status'],
          isCompleted: merged.isCompleted,
          body: merged.body,
          thumbnailUrl: merged.thumbnailUrl || undefined,
        });
      } catch {
        // apiClient already shows toast on error
      }
    },
    [contentId, draft],
  );

  const handlePublish = useCallback(
    async (domains: string[]) => {
      if (!draft) return;
      const result = await adminContentService.publishContent(contentId, domains);
      const publishedAt = result?.publishedAt ?? new Date().toISOString();
      updateDraft({ status: 'DONE', publishedAt });
      setShowPublishModal(false);
      toastStore.show('콘텐츠가 성공적으로 게시되었습니다.');
    },
    [contentId, draft, updateDraft],
  );

  const handleImageUpload = useCallback(async (file: File): Promise<string> => {
    try {
      return await adminContentService.uploadImage(file);
    } catch {
      toastStore.show('이미지 업로드에 실패했습니다.');
      return '';
    }
  }, []);

  return (
    <>
      <div className="flex h-full flex-col bg-white">
        {/* Panel header */}
        <div className="flex items-center justify-between border-b border-[#E8E8E8] px-4 py-3">
          {/* >> close icon */}
          <button
            type="button"
            onClick={onClose}
            className="flex items-center rounded p-1.5 text-[#6B6B6B] hover:bg-[#F5F5F5]"
            aria-label="패널 닫기"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path
                d="M6 3L11 8L6 13"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path
                d="M6 3L11 8L6 13"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => setShowPublishModal(true)}
            className="px-4 py-1.5 text-sm font-medium text-white"
            style={{ backgroundColor: '#1B4332' }}
          >
            게시
          </button>
        </div>

        {loading ? (
          <div className="space-y-3 px-4 py-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-6 animate-pulse rounded bg-gray-100" />
            ))}
          </div>
        ) : draft ? (
          <div className="flex flex-1 flex-col overflow-y-auto">
            {/* ── Meta fields (title / category / status / isCompleted) ── */}
            <div className="border-b border-[#E8E8E8] px-4 py-3 space-y-3">
              {/* Title — borderless, autofocus when empty */}
              <input
                autoFocus={!draft.title}
                type="text"
                value={draft.title}
                onChange={(e) => updateDraft({ title: e.target.value })}
                onBlur={() => handleSave()}
                placeholder="제목"
                className="w-full border-0 p-0 text-base font-medium text-[#1A1A1A] placeholder-[#BBBBBB] focus:outline-none"
              />

              {/* Category — label + selected tags, click to open picker */}
              <div ref={categoryRef} className="relative flex items-start gap-3">
                <span className="mt-0.5 shrink-0 text-xs text-[#6B6B6B]">카테고리</span>
                <div
                  className="flex flex-1 cursor-pointer flex-wrap items-center gap-1.5"
                  onClick={() => setShowCategoryPicker((v) => !v)}
                >
                  {draft.categories.length === 0 ? (
                    <span className="text-xs text-[#BBBBBB]">선택</span>
                  ) : (
                    draft.categories.map((cat) => (
                      <CategoryTag
                        key={cat}
                        label={cat}
                        onRemove={() => {
                          const next = draft.categories.filter((c) => c !== cat);
                          updateDraft({ categories: next });
                          handleSave({ categories: next });
                        }}
                      />
                    ))
                  )}
                  <span className="text-xs text-[#BBBBBB]">+</span>
                </div>
                {showCategoryPicker && (
                  <div className="absolute left-16 top-full z-20 mt-1 w-64">
                    <CategoryPicker
                      selected={draft.categories}
                      onChange={(next) => {
                        updateDraft({ categories: next });
                        handleSave({ categories: next });
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Status — label + selected status tag, click to open picker */}
              <div ref={statusRef} className="relative flex items-center gap-3">
                <span className="shrink-0 text-xs text-[#6B6B6B]">상태</span>
                <div className="cursor-pointer" onClick={() => setShowStatusPicker((v) => !v)}>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor(draft.status)}`}
                  >
                    {statusLabel(draft.status)}
                  </span>
                </div>
                {showStatusPicker && (
                  <div className="absolute left-10 top-full z-20 mt-1 flex flex-wrap gap-1.5 rounded border border-[#E8E8E8] bg-white p-2 shadow-md">
                    {STATUS_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          updateDraft({ status: opt.value });
                          handleSave({ status: opt.value });
                          setShowStatusPicker(false);
                        }}
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-opacity ${opt.color} ${draft.status === opt.value ? 'ring-1 ring-offset-1 ring-gray-400' : 'opacity-60 hover:opacity-100'}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* isCompleted — text + checkbox side by side */}
              <label className="flex cursor-pointer items-center gap-1.5">
                <span className="text-sm text-[#1A1A1A]">작성 완료</span>
                <input
                  type="checkbox"
                  checked={draft.isCompleted}
                  onChange={(e) => {
                    const isCompleted = e.target.checked;
                    updateDraft({ isCompleted });
                    handleSave({ isCompleted });
                  }}
                  className="h-4 w-4 cursor-pointer rounded accent-[#1B4332]"
                />
              </label>
            </div>

            {/* ── Editor area (below divider) ── */}
            <div className="flex flex-1 flex-col px-4 py-3">
              <div className="flex-1">
                <TiptapEditor
                  content={draft.body}
                  onChange={(html) => updateDraft({ body: html })}
                  onFirstImageChange={(url) => {
                    if (url !== null) updateDraft({ thumbnailUrl: url });
                  }}
                  onImageUpload={handleImageUpload}
                />
              </div>

              {/* Save button */}
              <div className="flex justify-end pt-3 pb-2">
                <button
                  type="button"
                  onClick={() => handleSave()}
                  className="border border-[#E8E8E8] px-4 py-2 text-sm text-[#6B6B6B] hover:bg-[#F5F5F5]"
                >
                  저장
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {showPublishModal && (
        <PublishModal onClose={() => setShowPublishModal(false)} onPublish={handlePublish} />
      )}
    </>
  );
}
