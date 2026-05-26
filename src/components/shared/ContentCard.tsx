import Link from 'next/link';
import Image from 'next/image';
import { DOMAIN_TABS } from '@/constants/domains';
import type { components } from '@/../../api-contract/generated/api-types';

type ContentItemDto = components['schemas']['ContentItemDto'];

interface ContentCardProps {
  item: ContentItemDto;
  currentDomain: string;
}

export function ContentCard({ item, currentDomain }: ContentCardProps) {
  return (
    <Link
      href={`/content/${item.id}`}
      className="group block overflow-hidden rounded-lg bg-white shadow-sm transition-all duration-[250ms] ease-out motion-reduce:transition-none hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
    >
      {/* 썸네일 */}
      <div className="relative aspect-video w-full overflow-hidden rounded-t-lg bg-gray-100">
        <Image
          src={item.thumbnailUrl ?? '/assets/default-content-thumbnail.png'}
          alt={item.title ?? ''}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
      </div>

      {/* 카드 내용 */}
      <div className="p-3">
        {/* 카테고리 태그 */}
        {item.categories && item.categories.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1">
            {item.categories.map((cat) => {
              const domain = DOMAIN_TABS.find((d) => d.key === cat);
              if (!domain) return null;
              const isCurrent = cat === currentDomain;
              return (
                <span
                  key={cat}
                  className="inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px]"
                  style={{
                    backgroundColor: domain.tagColor,
                    color: domain.tagTextColor,
                    fontWeight: isCurrent ? 700 : 400,
                    opacity: isCurrent ? 1 : 0.75,
                  }}
                >
                  {domain.emoji} {domain.label}
                </span>
              );
            })}
          </div>
        )}

        {/* 제목 */}
        <p className="line-clamp-2 text-[15px] font-semibold leading-[1.5] text-[#1A1A1A]">
          {item.title ?? '제목 없음'}
        </p>

        {/* 발행일자 */}
        {item.publishedAt && (
          <p className="mt-2 text-[13px] text-[#9E9E9E]">
            {new Date(item.publishedAt)
              .toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
              })
              .replace(/\. /g, '.')
              .replace(/\.$/, '')}
          </p>
        )}
      </div>
    </Link>
  );
}
