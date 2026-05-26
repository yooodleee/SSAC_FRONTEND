import Image from 'next/image';
import { ContentCard } from './ContentCard';
import { DOMAIN_IMAGE_MAP, DOMAIN_LABELS } from '@/constants/domains';
import type { components } from '@/../../api-contract/generated/api-types';

type ContentItemDto = components['schemas']['ContentItemDto'];

interface DomainContentsLayoutProps {
  domain: string;
  contents: ContentItemDto[];
}

export function DomainContentsLayout({ domain, contents }: DomainContentsLayoutProps) {
  const imageSrc = DOMAIN_IMAGE_MAP[domain];
  const label = DOMAIN_LABELS[domain as keyof typeof DOMAIN_LABELS] ?? domain;

  return (
    <div className="min-h-screen bg-white">
      {/* 배경 이미지 섹션 — LandingHeader가 fixed(h-16)이므로 pt-16으로 밀어냄 */}
      <div className="relative h-[25vh] w-full bg-[#F5F5F5] pt-16">
        {imageSrc && (
          <Image src={imageSrc} alt={label} fill className="object-cover" priority sizes="100vw" />
        )}
      </div>

      {/* 도메인명 */}
      <h1 className="mx-auto mt-8 mb-6 text-center text-[32px] font-[800] text-[#1A1A1A]">
        {label}
      </h1>

      {/* 콘텐츠 그리드 */}
      <div className="mx-auto max-w-[1200px] px-6 pb-16">
        {contents.length === 0 ? (
          /* Empty State */
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-2 rounded-xl border border-gray-100 bg-gray-50 py-16 text-center">
            <p className="text-base font-medium text-gray-700">아직 콘텐츠가 없어요</p>
            <p className="text-sm text-gray-400">곧 업데이트될 예정입니다!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4 lg:gap-6">
            {contents.map((item) => (
              <ContentCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
