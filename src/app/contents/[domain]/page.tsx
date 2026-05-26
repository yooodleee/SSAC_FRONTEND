import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { DomainContentsLayout } from '@/components/shared/DomainContentsLayout';
import { DOMAIN_CATEGORY_MAP, DOMAIN_LABELS } from '@/constants/domains';
import type { components } from '@/../../api-contract/generated/api-types';

type ApiResponseContentListResponse = components['schemas']['ApiResponseContentListResponse'];

export const revalidate = 3600;

interface DomainPageProps {
  params: Promise<{ domain: string }>;
}

export async function generateMetadata({ params }: DomainPageProps): Promise<Metadata> {
  const { domain } = await params;
  const label = DOMAIN_LABELS[domain as keyof typeof DOMAIN_LABELS];
  return { title: label ?? domain };
}

export default async function DomainPage({ params }: DomainPageProps) {
  const { domain } = await params;

  // 유효하지 않은 도메인 → 404
  if (!DOMAIN_CATEGORY_MAP[domain]) {
    notFound();
  }

  const apiBase = process.env.API_BASE_URL ?? '';
  const category = DOMAIN_CATEGORY_MAP[domain];

  let contents: components['schemas']['ContentItemDto'][] = [];

  try {
    const res = await fetch(`${apiBase}/api/v1/contents?category=${category}&size=20`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const json: ApiResponseContentListResponse = await res.json();
      contents = json.data?.contents ?? [];
    }
  } catch {
    // 서버 오류 시 빈 목록으로 empty state 표시
    contents = [];
  }

  return <DomainContentsLayout domain={domain} contents={contents} />;
}
