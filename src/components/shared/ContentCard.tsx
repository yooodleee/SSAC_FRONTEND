import Link from 'next/link';
import Image from 'next/image';
import type { components } from '@/../../api-contract/generated/api-types';

type ContentItemDto = components['schemas']['ContentItemDto'];

interface ContentCardProps {
  item: ContentItemDto;
}

export function ContentCard({ item }: ContentCardProps) {
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
        <p className="line-clamp-2 text-[15px] font-semibold leading-[1.5] text-[#1A1A1A]">
          {item.title ?? '제목 없음'}
        </p>
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
