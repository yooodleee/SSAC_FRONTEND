export default function SearchLoading() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-4 pt-24 pb-12 sm:px-6">
        {/* 헤더 스켈레톤 */}
        <div className="mb-8 space-y-2">
          <div className="h-7 w-48 animate-pulse rounded-lg bg-gray-200" />
          <div className="h-4 w-24 animate-pulse rounded-lg bg-gray-100" />
        </div>

        {/* 카드 스켈레톤 3개 */}
        <ul className="space-y-4">
          {[1, 2, 3].map((i) => (
            <li key={i} className="rounded-2xl border border-[#E8E8E8] bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <div className="h-5 w-20 animate-pulse rounded-full bg-gray-100" />
                <div className="h-5 w-12 animate-pulse rounded-full bg-gray-100" />
              </div>
              <div className="mb-2 h-5 w-3/4 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
              <div className="mt-3 flex justify-end">
                <div className="h-4 w-20 animate-pulse rounded bg-gray-100" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
