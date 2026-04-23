// Skeleton UI components for each home section.
// Used as Suspense fallbacks while Server Components fetch data.

function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-lg bg-gray-200 ${className}`} />;
}

export function CarouselSkeleton() {
  return (
    <section className="mb-12">
      <SkeletonBlock className="h-10 w-48 mb-6" />
      <SkeletonBlock className="h-72 w-full rounded-xl" />
      <div className="mt-4 flex justify-center gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonBlock key={i} className="h-2.5 w-2.5 rounded-full" />
        ))}
      </div>
    </section>
  );
}

export function QuizSkeleton() {
  return (
    <section className="mb-12">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <SkeletonBlock className="h-8 w-48 mb-2" />
          <SkeletonBlock className="h-4 w-64" />
        </div>
        <SkeletonBlock className="h-6 w-12 rounded-full" />
      </div>
      <div className="rounded-2xl border border-gray-100 bg-white p-6 sm:p-8">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonBlock key={i} className="h-2.5 w-2.5 rounded-full" />
            ))}
          </div>
          <SkeletonBlock className="h-4 w-8" />
        </div>
        <div className="mb-4 flex gap-2">
          <SkeletonBlock className="h-6 w-24 rounded-full" />
          <SkeletonBlock className="h-6 w-14 rounded-full" />
        </div>
        <SkeletonBlock className="h-6 w-full mb-2" />
        <SkeletonBlock className="h-6 w-4/5 mb-6" />
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonBlock key={i} className="h-12 w-full mb-2.5 rounded-xl" />
        ))}
      </div>
    </section>
  );
}

export function ContentSkeleton() {
  return (
    <section className="mb-12">
      <SkeletonBlock className="h-10 w-40 mb-6" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-gray-100 bg-white p-6">
            <SkeletonBlock className="h-5 w-full mb-2" />
            <SkeletonBlock className="h-5 w-5/6 mb-4" />
            <SkeletonBlock className="h-4 w-full mb-1" />
            <SkeletonBlock className="h-4 w-full mb-1" />
            <SkeletonBlock className="h-4 w-2/3" />
          </div>
        ))}
      </div>
    </section>
  );
}

export function NewsSkeleton() {
  return (
    <section className="mb-12">
      <SkeletonBlock className="h-10 w-32 mb-4" />
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-gray-100 bg-white p-5">
            <div className="mb-3 flex items-center justify-between">
              <SkeletonBlock className="h-5 w-16 rounded-full" />
              <SkeletonBlock className="h-4 w-20" />
            </div>
            <SkeletonBlock className="h-5 w-full mb-1" />
            <SkeletonBlock className="h-5 w-5/6 mb-3" />
            <SkeletonBlock className="h-4 w-full mb-1" />
            <SkeletonBlock className="h-4 w-full mb-1" />
            <SkeletonBlock className="h-4 w-2/3 mb-3" />
            <SkeletonBlock className="h-3 w-20" />
          </div>
        ))}
      </div>
    </section>
  );
}
