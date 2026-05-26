export default function DomainContentsLoading() {
  return (
    <div>
      {/* 이미지 스켈레톤 */}
      <div className="h-[25vh] w-full animate-pulse bg-gray-200" />

      {/* 도메인명 스켈레톤 */}
      <div className="mx-auto my-8 h-10 w-48 animate-pulse rounded-lg bg-gray-200" />

      {/* 카드 그리드 스켈레톤 */}
      <div className="mx-auto max-w-[1200px] px-6 pb-16">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4 lg:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-lg bg-white shadow-sm">
              <div className="aspect-video w-full animate-pulse rounded-t-lg bg-gray-200" />
              <div className="p-3">
                <div className="h-5 animate-pulse rounded bg-gray-200" />
                <div className="mt-2 h-5 w-3/4 animate-pulse rounded bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
