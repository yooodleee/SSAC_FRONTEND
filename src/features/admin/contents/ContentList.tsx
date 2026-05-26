'use client';

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type MouseEvent as ReactMouseEvent,
} from 'react';
import { adminContentService } from '@/services/adminContent';
import { CategoryTag, CategoryPicker } from './CategoryTag';
import { ContentEditPanel } from './ContentEditPanel';
import type { PanelChanges } from './ContentEditPanel';
import type { AdminContentItem } from '@/services/adminContent';

type ContentStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'DONE';
// UI-only type: UpdateContentRequest removed from BE contract
type UpdateContentRequest = { [key: string]: unknown };

// UI-only type: enriched row for the content list
interface ContentRow {
  id: string;
  title: string;
  categories: string[];
  status: ContentStatus;
  isCompleted: boolean;
  authorNickname: string;
  createdAt: string;
  publishedAt?: string;
}

// UI-only type: fixed-position dropdown state
interface DropdownState {
  type: 'category' | 'status';
  rowId: string;
  top: number;
  left: number;
  width: number;
}

const STATUS_LABELS: Record<ContentStatus, string> = {
  NOT_STARTED: '시작 전',
  IN_PROGRESS: '진행 중',
  DONE: '완료',
};

const STATUS_COLORS: Record<ContentStatus, string> = {
  NOT_STARTED: 'text-gray-500 bg-gray-100',
  IN_PROGRESS: 'text-blue-600 bg-blue-50',
  DONE: 'text-green-700 bg-green-50',
};

function formatDate(iso?: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
}

function SkeletonRow() {
  return (
    <tr className="border-b border-[#F5F5F5]">
      {[1, 2, 3, 4, 5, 6, 7].map((i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 animate-pulse rounded bg-gray-100" />
        </td>
      ))}
    </tr>
  );
}

export function ContentList() {
  const [rows, setRows] = useState<ContentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [titleDraft, setTitleDraft] = useState('');
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Single dropdown state for category / status (fixed-position to avoid overflow clipping)
  const [dropdown, setDropdown] = useState<DropdownState | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Drag-to-scroll (horizontal) for list when panel is open
  const listScrollRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{ active: boolean; startX: number; scrollLeft: number }>({
    active: false,
    startX: 0,
    scrollLeft: 0,
  });

  const handleListMouseDown = useCallback(
    (e: ReactMouseEvent<HTMLDivElement>) => {
      if (!panelOpen) return;
      const el = listScrollRef.current;
      if (!el) return;
      dragState.current = {
        active: true,
        startX: e.pageX - el.offsetLeft,
        scrollLeft: el.scrollLeft,
      };
      el.style.cursor = 'grabbing';
      el.style.userSelect = 'none';
    },
    [panelOpen],
  );

  const handleListMouseMove = useCallback((e: ReactMouseEvent<HTMLDivElement>) => {
    if (!dragState.current.active) return;
    const el = listScrollRef.current;
    if (!el) return;
    const x = e.pageX - el.offsetLeft;
    const walk = (x - dragState.current.startX) * 1.4;
    el.scrollLeft = dragState.current.scrollLeft - walk;
  }, []);

  const stopListDrag = useCallback(() => {
    if (!dragState.current.active) return;
    dragState.current.active = false;
    const el = listScrollRef.current;
    if (el) {
      el.style.cursor = '';
      el.style.userSelect = '';
    }
  }, []);

  // ── data fetch ──────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    const raf = requestAnimationFrame(() => {
      if (cancelled) return;
      setLoading(true);
      adminContentService
        .getContents()
        .then((data) => {
          if (cancelled) return;
          setRows(
            (data.contents ?? []).map((c: AdminContentItem) => ({
              id: c.id ?? '',
              title: c.title ?? '',
              categories: c.categories ?? [],
              status: (c.status as ContentStatus) ?? 'NOT_STARTED',
              isCompleted: c.isCompleted ?? false,
              authorNickname: c.authorNickname ?? '',
              createdAt: c.createdAt ?? '',
              publishedAt: c.publishedAt,
            })),
          );
        })
        .catch(() => {
          if (!cancelled) setError('콘텐츠 목록을 불러오는 데 실패했습니다.');
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, []);

  // ── dropdown: close on outside click or scroll ───────────────
  useEffect(() => {
    if (!dropdown) return;
    const onMouseDown = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdown(null);
      }
    };
    const onScroll = () => setDropdown(null);
    document.addEventListener('mousedown', onMouseDown);
    window.addEventListener('scroll', onScroll, true);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, [dropdown]);

  const openDropdown = useCallback(
    (e: React.MouseEvent, type: 'category' | 'status', rowId: string) => {
      if (dropdown?.rowId === rowId && dropdown?.type === type) {
        setDropdown(null);
        return;
      }
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      setDropdown({
        type,
        rowId,
        top: rect.bottom + 4,
        left: rect.left,
        width: type === 'category' ? Math.max(rect.width, 224) : Math.max(rect.width, 120),
      });
    },
    [dropdown],
  );

  // ── panel open/close ─────────────────────────────────────────
  const handleOpenPanel = useCallback((id: string) => {
    setSelectedId(id);
    setPanelOpen(true);
  }, []);

  const handleClosePanel = useCallback(() => {
    setPanelOpen(false);
    setSelectedId(null);
  }, []);

  const handlePanelUpdate = useCallback((id: string, changes: PanelChanges) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...changes } : row)));
  }, []);

  // ── add row ──────────────────────────────────────────────────
  const handleAddRow = useCallback(async () => {
    try {
      const created = await adminContentService.createContent();
      const newRow: ContentRow = {
        id: created.id ?? `temp-${Date.now()}`,
        title: created.title ?? '',
        categories: created.categories ?? [],
        status: (created.status as ContentStatus) ?? 'NOT_STARTED',
        isCompleted: created.isCompleted ?? false,
        authorNickname: created.authorNickname ?? '',
        createdAt: created.createdAt ?? new Date().toISOString(),
        publishedAt: created.publishedAt,
      };
      setRows((prev) => [newRow, ...prev]);
      handleOpenPanel(newRow.id);
    } catch {
      // service shows toast on error
    }
  }, [handleOpenPanel]);

  // ── inline edits ─────────────────────────────────────────────
  const handleTitleSave = useCallback(
    async (row: ContentRow) => {
      if (row.title === titleDraft) {
        setEditingTitleId(null);
        return;
      }
      const updatedTitle = titleDraft;
      setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, title: updatedTitle } : r)));
      setEditingTitleId(null);
      try {
        await adminContentService.updateContent(row.id, { title: updatedTitle });
      } catch {
        setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, title: row.title } : r)));
      }
    },
    [titleDraft],
  );

  const handleStatusChange = useCallback(async (row: ContentRow, status: ContentStatus) => {
    setDropdown(null);
    setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, status } : r)));
    try {
      await adminContentService.updateContent(row.id, {
        status: status as UpdateContentRequest['status'],
      });
    } catch {
      setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, status: row.status } : r)));
    }
  }, []);

  const handleCategoryChange = useCallback(async (row: ContentRow, categories: string[]) => {
    setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, categories } : r)));
    try {
      await adminContentService.updateContent(row.id, { categories });
    } catch {
      setRows((prev) =>
        prev.map((r) => (r.id === row.id ? { ...r, categories: row.categories } : r)),
      );
    }
  }, []);

  const handleCompletedToggle = useCallback(async (row: ContentRow) => {
    const isCompleted = !row.isCompleted;
    setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, isCompleted } : r)));
    try {
      await adminContentService.updateContent(row.id, { isCompleted });
    } catch {
      setRows((prev) =>
        prev.map((r) => (r.id === row.id ? { ...r, isCompleted: row.isCompleted } : r)),
      );
    }
  }, []);

  // ── active dropdown row ──────────────────────────────────────
  const activeRow = dropdown ? rows.find((r) => r.id === dropdown.rowId) : null;

  if (error) {
    return (
      <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
        {error}
      </div>
    );
  }

  return (
    <>
      {/* ── List area ── */}
      <div
        ref={listScrollRef}
        className={`overflow-auto${panelOpen ? ' cursor-grab select-none' : ''}`}
        onMouseDown={handleListMouseDown}
        onMouseMove={handleListMouseMove}
        onMouseUp={stopListDrag}
        onMouseLeave={stopListDrag}
      >
        {/* Header: Add button */}
        <div className="mb-3 flex items-center justify-end">
          <button
            type="button"
            onClick={handleAddRow}
            className="rounded-lg px-4 py-2 text-sm font-medium text-white"
            style={{ backgroundColor: '#1976D2' }}
          >
            추가하기
          </button>
        </div>

        {/* Table — table-fixed with explicit column widths for balanced layout */}
        <div className="rounded-xl border border-[#E8E8E8]">
          <table className="w-full table-fixed text-left text-sm">
            <colgroup>
              <col className="w-[28%]" />
              <col className="w-[20%]" />
              <col className="w-[10%]" />
              <col className="w-[7%]" />
              <col className="w-[14%]" />
              <col className="w-[11%]" />
              <col className="w-[10%]" />
            </colgroup>
            <thead className="bg-[#F9F9F9]">
              <tr className="border-b border-[#E8E8E8]">
                <th className="px-4 py-3 font-medium text-[#6B6B6B]">제목</th>
                <th className="px-4 py-3 font-medium text-[#6B6B6B]">카테고리</th>
                <th className="px-4 py-3 font-medium text-[#6B6B6B]">상태</th>
                <th className="px-4 py-3 text-center font-medium text-[#6B6B6B]">완료</th>
                <th className="px-4 py-3 font-medium text-[#6B6B6B]">생성일</th>
                <th className="px-4 py-3 font-medium text-[#6B6B6B]">작성자</th>
                <th className="px-4 py-3 font-medium text-[#6B6B6B]">발행일</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                : rows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-[#F5F5F5] hover:bg-[#FAFAFA]"
                      onMouseEnter={() => setHoveredId(row.id)}
                      onMouseLeave={() => setHoveredId(null)}
                    >
                      {/* Title */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-between gap-2">
                          {editingTitleId === row.id ? (
                            <input
                              autoFocus
                              type="text"
                              value={titleDraft}
                              onChange={(e) => setTitleDraft(e.target.value)}
                              onBlur={() => handleTitleSave(row)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleTitleSave(row);
                                if (e.key === 'Escape') setEditingTitleId(null);
                              }}
                              className="min-w-[120px] flex-1 rounded border border-[#1976D2] px-2 py-1 text-sm focus:outline-none"
                            />
                          ) : (
                            <span
                              className="cursor-text truncate text-[#1A1A1A]"
                              onClick={() => {
                                setEditingTitleId(row.id);
                                setTitleDraft(row.title);
                              }}
                            >
                              {row.title || <span className="text-[#BBBBBB]">(제목 없음)</span>}
                            </span>
                          )}

                          {/* Hover: open panel button (right end) */}
                          <div
                            className={`flex shrink-0 flex-col items-end transition-opacity ${
                              hoveredId === row.id ? 'opacity-100' : 'pointer-events-none opacity-0'
                            }`}
                          >
                            <span className="mb-0.5 text-[9px] leading-none text-[#BBBBBB]">
                              사이드 보기에서 열기
                            </span>
                            <button
                              type="button"
                              onClick={() => handleOpenPanel(row.id)}
                              className="rounded border border-[#E8E8E8] bg-white px-1.5 py-0.5 text-[11px] font-medium text-[#6B6B6B] shadow-sm hover:bg-[#F5F5F5]"
                            >
                              열기
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3">
                        <div
                          className="flex min-h-[28px] cursor-pointer flex-wrap gap-1 rounded-lg border border-transparent px-1.5 py-1 hover:border-[#E8E8E8]"
                          onClick={(e) => openDropdown(e, 'category', row.id)}
                        >
                          {row.categories.length === 0 ? (
                            <span className="text-[#BBBBBB]">—</span>
                          ) : (
                            row.categories.map((cat) => <CategoryTag key={cat} label={cat} small />)
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <span
                          className={`cursor-pointer rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[row.status]}`}
                          onClick={(e) => openDropdown(e, 'status', row.id)}
                        >
                          {STATUS_LABELS[row.status]}
                        </span>
                      </td>

                      {/* isCompleted */}
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={row.isCompleted}
                          onChange={() => handleCompletedToggle(row)}
                          className="h-4 w-4 cursor-pointer rounded accent-[#1B4332]"
                        />
                      </td>

                      {/* createdAt */}
                      <td className="px-4 py-3 text-xs text-[#6B6B6B]">
                        {formatDate(row.createdAt)}
                      </td>

                      {/* author */}
                      <td className="px-4 py-3 text-xs text-[#6B6B6B]">{row.authorNickname}</td>

                      {/* publishedAt */}
                      <td className="px-4 py-3 text-xs text-[#6B6B6B]">
                        {formatDate(row.publishedAt)}
                      </td>
                    </tr>
                  ))}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-sm text-[#BBBBBB]">
                    콘텐츠가 없습니다. [추가하기]를 눌러 첫 콘텐츠를 작성해보세요.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Fixed dropdown (category / status) ── */}
      {dropdown && (
        <div
          ref={dropdownRef}
          className="fixed z-50"
          style={{ top: dropdown.top, left: dropdown.left, width: dropdown.width }}
        >
          {dropdown.type === 'category' && activeRow && (
            <CategoryPicker
              selected={activeRow.categories}
              onChange={(next) => handleCategoryChange(activeRow, next)}
            />
          )}
          {dropdown.type === 'status' && activeRow && (
            <div className="overflow-hidden rounded-lg border border-[#E8E8E8] bg-white py-1 shadow-md">
              {(Object.keys(STATUS_LABELS) as ContentStatus[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleStatusChange(activeRow, s)}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-sm text-[#1A1A1A] hover:bg-[#F5F5F5] ${activeRow.status === s ? 'font-semibold' : ''}`}
                >
                  <span
                    className={`inline-block h-2 w-2 rounded-full ${
                      s === 'NOT_STARTED'
                        ? 'bg-gray-400'
                        : s === 'IN_PROGRESS'
                          ? 'bg-blue-500'
                          : 'bg-green-600'
                    }`}
                  />
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Fixed right panel + backdrop ── */}
      {panelOpen && selectedId && (
        <>
          {/* Transparent backdrop: click outside panel closes it */}
          <div className="fixed bottom-0 left-0 right-0 top-16 z-30" onClick={handleClosePanel} />
          {/* Panel: starts exactly at nav bottom (top-16 = h-16 nav) */}
          <div className="panel-slide-in fixed bottom-0 right-0 top-16 z-40 w-[50vw] overflow-hidden border-l border-[#E8E8E8] bg-white shadow-xl">
            <ContentEditPanel
              contentId={selectedId}
              onClose={handleClosePanel}
              onUpdate={handlePanelUpdate}
            />
          </div>
        </>
      )}
    </>
  );
}
