import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import Image from 'next/image';
import type { Metadata } from 'next';
import type { components } from '@/../../api-contract/generated/api-types';
import { DOMAIN_TABS, DOMAIN_IMAGE_MAP } from '@/constants/domains';

type ContentDetailResponse = components['schemas']['ContentDetailResponse'];
type ApiResponse = components['schemas']['ApiResponseContentDetailResponse'];

export const dynamic = 'force-dynamic';

interface ContentDetailPageProps {
  params: Promise<{ id: string }>;
}

// ─── Notion 블록 렌더러 ───────────────────────────────────────────────────────

/**
 * BE는 Gson을 통해 Notion API 원본 형식으로 직렬화해서 내려준다.
 * - type: "heading_2", "heading_3", "callout", "image" 등 Notion API snake_case
 * - 콘텐츠 키: type명과 동일 → block["heading_2"], block["callout"]
 * - richText 키: "rich_text" (snake_case)
 * - plainText 키: "plain_text" (snake_case)
 */
type RichTextItem = {
  plain_text?: string; // Notion 원본 snake_case (BE Gson 직렬화)
  plainText?: string; // camelCase fallback
  text?: { content?: string }; // Notion API nested text.content fallback
  annotations?: {
    bold?: boolean;
    italic?: boolean;
    strikethrough?: boolean;
    code?: boolean;
  };
  href?: string | null;
};

/**
 * BE 직렬화 방식에 따라 다양한 형식으로 올 수 있는 블록 타입을 정규화한다.
 * - Notion Java SDK enum (HeadingOne/Two/Three)
 * - 숫자형 PascalCase (Heading1/2/3)
 * - Notion API 원본 snake_case (heading_1/2/3, bulleted_list_item 등)
 * - 소문자 (callout, paragraph 등)
 */
const BLOCK_TYPE_ALIASES: Record<string, string> = {
  // Heading variants
  heading_1: 'HeadingOne',
  Heading1: 'HeadingOne',
  heading_2: 'HeadingTwo',
  Heading2: 'HeadingTwo',
  heading_3: 'HeadingThree',
  Heading3: 'HeadingThree',
  // List variants
  bulleted_list_item: 'BulletedListItem',
  numbered_list_item: 'NumberedListItem',
  // Table variants
  table: 'Table',
  table_row: 'TableRow',
  // To-do (checkbox) variants
  to_do: 'ToDo',
  ToDo: 'ToDo',
  // Other lowercase variants
  callout: 'Callout',
  paragraph: 'Paragraph',
  quote: 'Quote',
  toggle: 'Toggle',
  divider: 'Divider',
  image: 'Image',
  code: 'Code',
};

/** type → 콘텐츠 키 ("Image" → "image", "BulletedListItem" → "bulletedListItem") */
function toContentKey(type: string): string {
  return type.charAt(0).toLowerCase() + type.slice(1);
}

/**
 * 블록에서 richText 배열 추출.
 * rawType (BE 원본)과 normalizedType (정규화) 모두를 content key 후보로 시도한다.
 */
function extractRichText(
  block: Record<string, unknown>,
  rawType: string,
  normalizedType: string,
): RichTextItem[] {
  // 시도할 content key 후보 목록 (우선순위 순)
  const candidateKeys = [
    toContentKey(normalizedType), // e.g., "headingTwo"
    toContentKey(rawType), // e.g., "heading2", "heading_2"
    rawType, // e.g., "heading_2" (snake_case 원본)
  ];

  for (const key of candidateKeys) {
    const data = block[key] as Record<string, unknown> | undefined;
    if (data && typeof data === 'object') {
      // BE 필드명 후보: richText(camelCase) · rich_text(snake) · text · texts
      const rt = data.richText ?? data.rich_text ?? data.text ?? data.texts;
      if (Array.isArray(rt)) return rt as RichTextItem[];
    }
  }
  return [];
}

function renderRichText(richTexts: RichTextItem[]): React.ReactNode {
  if (!richTexts.length) return null;
  return richTexts.map((rt, i) => {
    const text = rt.plain_text ?? rt.plainText ?? rt.text?.content ?? '';
    const { bold, italic, strikethrough, code } = rt.annotations ?? {};

    let node: React.ReactNode = text;
    if (code) {
      node = (
        <code key={i} className="rounded bg-gray-100 px-1 py-0.5 font-mono text-[13px]">
          {text}
        </code>
      );
    } else {
      if (bold)
        node = (
          <strong key={i} className="font-semibold">
            {node}
          </strong>
        );
      if (italic) node = <em key={i}>{node}</em>;
      if (strikethrough) node = <s key={i}>{node}</s>;
      if (rt.href) {
        node = (
          <a
            key={i}
            href={rt.href}
            className="text-[#4CAF82] underline decoration-[#4CAF82]"
            target="_blank"
            rel="noopener noreferrer"
          >
            {node}
          </a>
        );
      }
    }
    return <span key={i}>{node}</span>;
  });
}

type NotionBlock = Record<string, unknown>;

function renderChildBlocks(children: NotionBlock[]) {
  if (!children.length) return null;
  return children.map((child, i) => (
    <NotionBlockRenderer key={(child?.id as string | undefined) ?? i} block={child} />
  ));
}

function NotionBlockRenderer({ block }: { block: NotionBlock }) {
  if (!block || typeof block !== 'object') return null;

  const rawType = block.type as string | undefined;
  if (!rawType) return null;

  // BE 직렬화 형식에 무관하게 정규화된 타입으로 처리
  const type = BLOCK_TYPE_ALIASES[rawType] ?? rawType;

  const richTexts = extractRichText(block, rawType, type);
  // blockData: 정규화 타입 키 → 원본 타입 키 순으로 시도
  const contentKey = toContentKey(type);
  const rawContentKey = toContentKey(rawType);
  const blockData = (block[contentKey] ?? block[rawContentKey] ?? block[rawType]) as
    | Record<string, unknown>
    | undefined;

  // has_children: true인 블록은 children 배열이 항상 포함됨 (BE 변경 사항)
  const children = Array.isArray(block.children) ? (block.children as NotionBlock[]) : [];

  switch (type) {
    // Notion Java SDK enum: HeadingOne / HeadingTwo / HeadingThree
    case 'HeadingOne':
      return (
        <h2 className="mb-4 mt-8 text-[22px] font-bold leading-[1.3] text-[#1A1A1A]">
          {renderRichText(richTexts)}
        </h2>
      );
    case 'HeadingTwo':
      return (
        <h3 className="mb-3 mt-6 text-[18px] font-bold leading-[1.3] text-[#1A1A1A]">
          {renderRichText(richTexts)}
        </h3>
      );
    case 'HeadingThree':
      return (
        <h4 className="mb-2 mt-5 text-[16px] font-bold leading-[1.3] text-[#1A1A1A]">
          {renderRichText(richTexts)}
        </h4>
      );
    case 'Paragraph':
      return richTexts.length === 0 ? (
        <div className="h-3" />
      ) : (
        <p className="mb-3 text-[15px] leading-[1.6] text-[#1A1A1A]">{renderRichText(richTexts)}</p>
      );
    case 'BulletedListItem':
      return (
        <li className="mb-1 ml-5 list-disc text-[15px] leading-[1.6] text-[#1A1A1A]">
          {renderRichText(richTexts)}
          {children.length > 0 && <ul className="mt-1">{renderChildBlocks(children)}</ul>}
        </li>
      );
    case 'NumberedListItem': {
      // BE에서 number 필드를 주입하므로 이를 사용해 명시적 순번 표시
      // (list-decimal CSS는 <ol> 없이 단독 <li>로는 번호가 표시되지 않음)
      const num = blockData?.number as number | undefined;
      return (
        <div className="mb-1 flex items-start gap-2 text-[15px] leading-[1.6] text-[#1A1A1A]">
          <span className="shrink-0 font-medium">{num ?? '•'}.</span>
          <div className="min-w-0 flex-1">
            {renderRichText(richTexts)}
            {children.length > 0 && <div className="mt-1">{renderChildBlocks(children)}</div>}
          </div>
        </div>
      );
    }
    case 'Quote':
      return (
        <blockquote className="my-4 border-l-4 border-[#4CAF82] pl-4 text-[15px] italic leading-[1.6] text-[#6B6B6B]">
          {richTexts.length > 0 && renderRichText(richTexts)}
          {children.length > 0 && (
            <div className={richTexts.length > 0 ? 'mt-2' : ''}>{renderChildBlocks(children)}</div>
          )}
        </blockquote>
      );
    case 'Toggle':
      return (
        <details className="my-2 rounded-xl border border-[#E8E8E8] p-3">
          <summary className="cursor-pointer text-[15px] font-medium leading-[1.6] text-[#1A1A1A]">
            {renderRichText(richTexts)}
          </summary>
          {children.length > 0 && <div className="mt-2 pl-2">{renderChildBlocks(children)}</div>}
        </details>
      );
    case 'Divider':
      return <hr className="my-6 border-[#E8E8E8]" />;
    case 'Callout': {
      return (
        <div className="my-4 flex items-start gap-3 rounded-xl bg-[#E8F5EE] p-4">
          <Image
            src="/gress.png"
            alt="SSAC"
            width={22}
            height={22}
            className="shrink-0 object-contain"
          />
          <div className="min-w-0 flex-1 text-[15px] leading-[1.6] text-[#1A1A1A]">
            {richTexts.length > 0 && renderRichText(richTexts)}
            {children.length > 0 && (
              <div className={richTexts.length > 0 ? 'mt-2' : ''}>
                {renderChildBlocks(children)}
              </div>
            )}
          </div>
        </div>
      );
    }
    case 'ToDo': {
      const checked = blockData?.checked as boolean | undefined;
      return (
        <div className="mb-2 flex items-start gap-2">
          <input
            type="checkbox"
            checked={checked ?? false}
            readOnly
            className="mt-[3px] h-4 w-4 shrink-0 accent-[#4CAF82]"
          />
          <span
            className={`text-[15px] leading-[1.6] ${checked ? 'text-[#9E9E9E] line-through' : 'text-[#1A1A1A]'}`}
          >
            {renderRichText(richTexts)}
          </span>
        </div>
      );
    }
    case 'Image': {
      // image.file.url: Cloudinary 영구 URL (expiryTime 무시)
      const file = blockData?.file as Record<string, unknown> | undefined;
      const external = blockData?.external as Record<string, unknown> | undefined;
      const src = (file?.url as string | undefined) ?? (external?.url as string | undefined);
      const caption = Array.isArray(blockData?.caption)
        ? (blockData.caption as RichTextItem[])
        : [];
      if (!src) return null;
      return (
        <figure className="my-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={caption.map((c) => c.plain_text ?? c.plainText).join('') || '이미지'}
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
    case 'Table': {
      const tableData = blockData as
        | { table_width?: number; has_column_header?: boolean; has_row_header?: boolean }
        | undefined;
      const hasColumnHeader = tableData?.has_column_header ?? false;
      const hasRowHeader = tableData?.has_row_header ?? false;

      // children 내 table_row 블록만 추출
      const rows = children.filter((c) => (c.type as string) === 'table_row');
      if (rows.length === 0) return null;

      const renderCells = (row: NotionBlock, isHeaderRow: boolean) => {
        const rowData = (row.table_row ?? row.tableRow) as { cells?: RichTextItem[][] } | undefined;
        const cells = rowData?.cells ?? [];
        return cells.map((cell, colIdx) => {
          const isHeader = isHeaderRow || (hasRowHeader && colIdx === 0);
          const Tag = isHeader ? 'th' : 'td';
          return (
            <Tag
              key={colIdx}
              className={[
                'border border-[#E8E8E8] px-3 py-2 text-left text-[14px] leading-[1.6]',
                isHeader ? 'bg-[#F5F5F5] font-semibold text-[#1A1A1A]' : 'text-[#1A1A1A]',
              ].join(' ')}
            >
              {renderRichText(cell)}
            </Tag>
          );
        });
      };

      const headerRow = hasColumnHeader ? rows[0] : null;
      const bodyRows = hasColumnHeader ? rows.slice(1) : rows;

      return (
        <div className="my-4 overflow-x-auto rounded-xl border border-[#E8E8E8]">
          <table className="w-full border-collapse text-[14px]">
            {headerRow && (
              <thead>
                <tr>{renderCells(headerRow, true)}</tr>
              </thead>
            )}
            <tbody>
              {bodyRows.map((row, i) => (
                <tr key={(row?.id as string | undefined) ?? i} className="even:bg-[#F5F5F5]/40">
                  {renderCells(row, false)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    case 'Code': {
      const lang = blockData?.language as string | undefined;
      if (richTexts.length === 0) {
        console.warn(
          '[NotionBlockRenderer] Code 블록 richText 비어있음 — block["code"] 구조:',
          JSON.stringify(blockData ?? block['code'] ?? block),
        );
      }
      return (
        <pre className="my-4 overflow-x-auto rounded-xl bg-gray-900 p-4 text-[13px] leading-[1.6] text-green-400">
          <code data-language={lang}>{renderRichText(richTexts)}</code>
        </pre>
      );
    }
    default:
      console.warn('[NotionBlockRenderer] 처리되지 않은 블록 타입:', {
        rawType,
        normalizedType: type,
        blockKeys: Object.keys(block),
      });
      return null;
  }
}

// ─── 난이도 스타일 ─────────────────────────────────────────────────────────────

const DIFFICULTY_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  SEED: { bg: '#E8F5EE', text: '#4CAF82', label: '🌱 씨앗' },
  SPROUT: { bg: '#FFF8E1', text: '#F9A825', label: '🌿 새싹' },
  TREE: { bg: '#E3F2FD', text: '#1976D2', label: '🌳 나무' },
};

// ─── 데이터 페치 ──────────────────────────────────────────────────────────────

async function fetchContentDetail(
  numericId: number,
  token: string | undefined,
): Promise<{ detail: ContentDetailResponse | null; status: number }> {
  const apiBase = process.env.API_BASE_URL ?? '';
  const authHeader: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

  try {
    const res = await fetch(`${apiBase}/api/v1/contents/${numericId}`, {
      headers: authHeader,
      cache: 'no-store',
    });
    if (res.status === 404) return { detail: null, status: 404 };
    if (!res.ok) return { detail: null, status: res.status };
    const json = (await res.json()) as ApiResponse;
    return { detail: json.data ?? null, status: 200 };
  } catch {
    return { detail: null, status: 500 };
  }
}

// ─── 페이지 ──────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: ContentDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const numericId = Number(id);
  if (isNaN(numericId)) return { title: '콘텐츠' };
  const { detail } = await fetchContentDetail(numericId, undefined);
  return { title: detail?.title ?? '콘텐츠' };
}

export default async function ContentDetailPage({ params }: ContentDetailPageProps) {
  const { id } = await params;
  const numericId = Number(id);
  if (isNaN(numericId)) notFound();

  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;

  const { detail, status } = await fetchContentDetail(numericId, token);

  if (status === 404) notFound();

  if (status !== 200 || !detail) {
    return (
      <div className="container-page pt-20 pb-12">
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <p className="text-[15px] text-gray-500">연결이 불안정해요. 잠시 후 다시 시도해주세요.</p>
        </div>
      </div>
    );
  }

  const blocks = Array.isArray(detail.blocks) ? (detail.blocks as NotionBlock[]) : [];
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

  const firstCategory = detail.categories?.[0] ?? '';
  const bannerSrc = DOMAIN_IMAGE_MAP[firstCategory];

  return (
    <div className="min-h-screen bg-white">
      {/* 배너 이미지 — /contents/realestate와 동일한 h-[25vh] w-full */}
      <div className="relative h-[25vh] w-full bg-[#F5F5F5] pt-14 md:pt-[85px]">
        {bannerSrc && (
          <Image
            src={bannerSrc}
            alt={firstCategory}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        )}
      </div>

      {/* 본문 */}
      <div className="container-page pb-12 pt-8">
        <article className="mx-auto max-w-3xl">
          {/* 제목 */}
          <h1 className="mb-4 text-[28px] font-bold leading-[1.3] text-[#1A1A1A]">
            {detail.title ?? '제목 없음'}
          </h1>

          {/* 메타 정보 — 제목 아래에 배치 */}
          <div className="mb-8 flex flex-wrap items-center gap-2">
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

            {difficultyStyle && (
              <span
                className="rounded-full px-2 py-0.5 text-[11px] font-medium"
                style={{ backgroundColor: difficultyStyle.bg, color: difficultyStyle.text }}
              >
                {detail.difficulty}
              </span>
            )}

            {editedAt && <span className="text-[13px] text-[#9E9E9E]">{editedAt}</span>}
          </div>

          {/* Notion 본문 */}
          {blocks.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-[#E8E8E8] bg-[#F5F5F5] py-16 text-center">
              <p className="text-[15px] text-[#6B6B6B]">아직 본문이 준비되지 않았어요.</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-[#E8E8E8] bg-white p-6 shadow-sm sm:p-8">
              {blocks.map((block, i) => (
                <NotionBlockRenderer key={(block?.id as string | undefined) ?? i} block={block} />
              ))}
            </div>
          )}
        </article>
      </div>
    </div>
  );
}
