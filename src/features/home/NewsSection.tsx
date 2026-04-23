import { homeService } from '@/services/home';
import { formatRelativeTime } from '@/lib/utils';
import type { NewsItem } from '@/types';

const MS_24H = 24 * 60 * 60 * 1000;

export async function NewsSection() {
  let items: NewsItem[];

  try {
    items = await homeService.getNews();
  } catch {
    return (
      <section className="mb-12">
        <NewsSectionHeader />
        <div className="rounded-xl border border-red-100 bg-red-50 p-6 text-center text-sm text-red-600">
          뉴스를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
        </div>
      </section>
    );
  }

  // 최신순 정렬
  const sorted = [...items].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );

  // eslint-disable-next-line react-hooks/purity -- Server Component: Date.now()는 요청 당 1회 실행
  const now = Date.now();
  const recentItems = sorted.filter((item) => now - new Date(item.publishedAt).getTime() < MS_24H);
  const hasNoRecent = recentItems.length === 0;
  const displayItems = hasNoRecent ? sorted : recentItems;

  return (
    <section className="mb-12">
      <NewsSectionHeader />

      {hasNoRecent && (
        <p className="mb-4 rounded-lg bg-amber-50 px-4 py-2.5 text-sm text-amber-700">
          최신 뉴스가 없습니다. 가장 최근 뉴스를 표시합니다.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {displayItems.map((item) => (
          <NewsCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}

function NewsSectionHeader() {
  return <h2 className="mb-4 text-2xl font-bold text-gray-900">금융 뉴스</h2>;
}

function NewsCard({ item }: { item: NewsItem }) {
  return (
    <article className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      {/* 카테고리 태그 + 출처 */}
      <div className="flex items-center justify-between">
        <span className="inline-block rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
          {item.category}
        </span>
        <span className="text-xs text-gray-400">{item.source}</span>
      </div>

      {/* 제목 */}
      <h3 className="line-clamp-2 font-semibold capitalize leading-snug text-gray-900">
        {item.title}
      </h3>

      {/* 요약 */}
      <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-gray-500">{item.summary}</p>

      {/* 발행 시간 */}
      <time dateTime={item.publishedAt} className="mt-auto text-xs text-gray-400">
        {formatRelativeTime(item.publishedAt)}
      </time>
    </article>
  );
}
