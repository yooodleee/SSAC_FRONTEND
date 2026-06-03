import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import Link from 'next/link';
import type { Metadata } from 'next';
import type { components } from '@/../../api-contract/generated/api-types';
import { DOMAIN_TABS } from '@/constants/domains';
import { Button } from '@/components/ui/Button';

type ContentDetailResponse = components['schemas']['ContentDetailResponse'];
type ApiResponse = components['schemas']['ApiResponseContentDetailResponse'];

export const dynamic = 'force-dynamic';

interface ContentDetailPageProps {
  params: Promise<{ id: string }>;
}

// ─── Notion 블록 렌더러 ───────────────────────────────────────────────────────

type RichTextItem = {
  plain_text?: string;
  annotations?: {
    bold?: boolean;
    italic?: boolean;
    strikethrough?: boolean;
    code?: boolean;
  };
  href?: string | null;
};

function renderRichText(richTexts: RichTextItem[]): React.ReactNode {
  if (!richTexts?.length) return null;
  return richTexts.map((rt, i) => {
    const text = rt.plain_text ?? '';
    const { bold, italic, strikethrough, code } = rt.annotations ?? {};

    let node: React.ReactNode = text;
    if (code)
      node = (
        <code
          key={i}
          className="rounded bg-gray-100 px-1 py-0.5 font-mono text-[13px] text-[#1A1A1A]"
        >
          {text}
        </code>
      );
    else {
      if (bold)
        node = (
          <strong key={i} className="font-semibold">
            {node}
          </strong>
        );
      if (italic) node = <em key={i}>{node}</em>;
      if (strikethrough) node = <s key={i}>{node}</s>;
      if (rt.href)
        node = (
          <a
            key={i}
            href={rt.href}
            className="underline decoration-[#4CAF82] text-[#4CAF82]"
            target="_blank"
            rel="noopener noreferrer"
          >
            {node}
          </a>
        );
    }
    return <span key={i}>{node}</span>;
  });
}

type NotionBlock = Record<string, unknown>;

function NotionBlockRenderer({ block }: { block: NotionBlock }) {
  const type = block.type as string | undefined;
  if (!type) return null;

  const data = block[type] as Record<string, unknown> | undefined;
  const richTexts = (data?.rich_text as RichTextItem[] | undefined) ?? [];

  switch (type) {
    case 'heading_1':
      return (
        <h2 className="mb-4 mt-8 text-[22px] font-bold leading-[1.3] text-[#1A1A1A]">
          {renderRichText(richTexts)}
        </h2>
      );
    case 'heading_2':
      return (
        <h3 className="mb-3 mt-6 text-[18px] font-semibold leading-[1.3] text-[#1A1A1A]">
          {renderRichText(richTexts)}
        </h3>
      );
    case 'heading_3':
      return (
        <h4 className="mb-2 mt-5 text-[16px] font-semibold leading-[1.3] text-[#1A1A1A]">
          {renderRichText(richTexts)}
        </h4>
      );
    case 'paragraph':
      return richTexts.length === 0 ? (
        <div className="h-3" />
      ) : (
        <p className="mb-3 text-[15px] leading-[1.6] text-[#1A1A1A]">{renderRichText(richTexts)}</p>
      );
    case 'bulleted_list_item':
      return (
        <li className="mb-1 ml-5 list-disc text-[15px] leading-[1.6] text-[#1A1A1A]">
          {renderRichText(richTexts)}
        </li>
      );
    case 'numbered_list_item':
      return (
        <li className="mb-1 ml-5 list-decimal text-[15px] leading-[1.6] text-[#1A1A1A]">
          {renderRichText(richTexts)}
        </li>
      );
    case 'quote':
      return (
        <blockquote className="my-4 border-l-4 border-[#4CAF82] pl-4 text-[15px] italic leading-[1.6] text-[#6B6B6B]">
          {renderRichText(richTexts)}
        </blockquote>
      );
    case 'divider':
      return <hr className="my-6 border-[#E8E8E8]" />;
    case 'callout': {
      const icon = data?.icon as Record<string, unknown> | undefined;
      const emoji = (icon?.emoji as string | undefined) ?? '💡';
      return (
        <div className="my-4 flex gap-3 rounded-xl bg-[#E8F5EE] p-4">
          <span className="text-xl leading-[1.6]">{emoji}</span>
          <p className="text-[15px] leading-[1.6] text-[#1A1A1A]">{renderRichText(richTexts)}</p>
        </div>
      );
    }
    case 'image': {
      const file = data?.file as Record<string, unknown> | undefined;
      const external = data?.external as Record<string, unknown> | undefined;
      const src = (file?.url as string | undefined) ?? (external?.url as string | undefined);
      const caption = (data?.caption as RichTextItem[] | undefined) ?? [];
      if (!src) return null;
      return (
        <figure className="my-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={caption.map((c) => c.plain_text).join('') || '이미지'}
            className="w-full rounded-xl"
          />
          {caption.length > 0 && (
            <figcaption className="mt-2 text-center text-[13px] text-[#6B6B6B]">
              {renderRichText(caption)}
            </figcaption>
          )}
        </figure>
      );
    }
    case 'code': {
      const lang = data?.language as string | undefined;
      return (
        <pre className="my-4 overflow-x-auto rounded-xl bg-gray-900 p-4 text-[13px] leading-[1.6] text-green-400">
          <code data-language={lang}>{renderRichText(richTexts)}</code>
        </pre>
      );
    }
    default:
      return null;
  }
}

// ─── 난이도 스타일 ─────────────────────────────────────────────────────────────

const DIFFICULTY_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  SEED: { bg: '#E8F5EE', text: '#4CAF82', label: '🌱 씨앗' },
  SPROUT: { bg: '#FFF8E1', text: '#F9A825', label: '🌿 새싹' },
  TREE: { bg: '#E3F2FD', text: '#1976D2', label: '🌳 나무' },
};

// ─── 페이지 ──────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: ContentDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const apiBase = process.env.API_BASE_URL ?? '';
  try {
    const res = await fetch(`${apiBase}/api/v1/contents/${id}`, { cache: 'no-store' });
    if (res.ok) {
      const json = (await res.json()) as ApiResponse;
      return { title: json.data?.title ?? '콘텐츠' };
    }
  } catch {
    // fallback
  }
  return { title: '콘텐츠' };
}

export default async function ContentDetailPage({ params }: ContentDetailPageProps) {
  const { id } = await params;
  const numericId = Number(id);
  if (isNaN(numericId)) notFound();

  const apiBase = process.env.API_BASE_URL ?? '';
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;
  const authHeader: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

  let detail: ContentDetailResponse | null = null;
  let fetchError = false;

  try {
    const res = await fetch(`${apiBase}/api/v1/contents/${numericId}`, {
      headers: authHeader,
      cache: 'no-store',
    });

    if (res.status === 404) notFound();

    if (res.ok) {
      const json = (await res.json()) as ApiResponse;
      detail = json.data ?? null;
    } else {
      fetchError = true;
    }
  } catch {
    fetchError = true;
  }

  if (fetchError) {
    return (
      <div className="container-page py-12">
        <Link href="/content">
          <Button variant="ghost" size="sm" className="mb-6">
            ← 콘텐츠 목록으로
          </Button>
        </Link>
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <p className="text-[15px] text-[#6B6B6B]">
            연결이 불안정해요. 잠시 후 다시 시도해주세요.
          </p>
        </div>
      </div>
    );
  }

  if (!detail) notFound();

  const blocks = (detail.blocks ?? []) as NotionBlock[];
  const difficultyStyle = DIFFICULTY_STYLE[detail.difficulty ?? ''] ?? null;

  const editedAt = detail.notionLastEditedAt
    ? new Date(detail.notionLastEditedAt)
        .toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        })
        .replace(/\. /g, '.')
        .replace(/\.$/, '')
    : null;

  return (
    <div className="container-page py-12">
      <Link href="/content">
        <Button variant="ghost" size="sm" className="mb-6">
          ← 콘텐츠 목록으로
        </Button>
      </Link>

      <article className="mx-auto max-w-3xl">
        {/* 메타 정보 */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {/* 카테고리 태그 */}
          {(detail.categories ?? []).map((cat) => {
            const domain = DOMAIN_TABS.find((d) => d.key === cat);
            if (!domain) return null;
            return (
              <span
                key={cat}
                className="inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-medium"
                style={{ backgroundColor: domain.tagColor, color: domain.tagTextColor }}
              >
                {domain.emoji} {domain.label}
              </span>
            );
          })}

          {/* 난이도 */}
          {difficultyStyle && (
            <span
              className="rounded-full px-2 py-0.5 text-[11px] font-medium"
              style={{ backgroundColor: difficultyStyle.bg, color: difficultyStyle.text }}
            >
              {detail.difficultyLabel ?? difficultyStyle.label}
            </span>
          )}

          {/* 최종 수정일 */}
          {editedAt && <span className="text-[13px] text-[#9E9E9E]">{editedAt}</span>}
        </div>

        {/* 제목 */}
        <h1 className="mb-8 text-[28px] font-bold leading-[1.3] text-[#1A1A1A]">
          {detail.title ?? '제목 없음'}
        </h1>

        {/* Notion 본문 */}
        {blocks.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-[#E8E8E8] bg-[#F5F5F5] py-16 text-center">
            <p className="text-[15px] text-[#6B6B6B]">아직 본문이 준비되지 않았어요.</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-[#E8E8E8] bg-white p-6 shadow-sm sm:p-8">
            {blocks.map((block, i) => (
              <NotionBlockRenderer key={(block.id as string | undefined) ?? i} block={block} />
            ))}
          </div>
        )}
      </article>
    </div>
  );
}
