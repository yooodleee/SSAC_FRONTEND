import type { components } from '@/api-contract/generated/api-types';
import { NewsSectionClient } from './NewsSectionClient';

type NewsItemResponse = components['schemas']['NewsItemResponse'];

export async function NewsSection() {
  let items: NewsItemResponse[] = [];
  let initialError = false;

  const apiBaseUrl = process.env.API_BASE_URL;
  if (apiBaseUrl) {
    try {
      const res = await fetch(`${apiBaseUrl}/api/news?sort=latest`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const body = (await res.json()) as {
          data?: components['schemas']['NewsListResponse'];
        };
        items = body.data?.contents ?? [];
      } else {
        initialError = true;
      }
    } catch {
      initialError = true;
    }
  } else {
    initialError = true;
  }

  return <NewsSectionClient initialItems={items} initialError={initialError} />;
}
