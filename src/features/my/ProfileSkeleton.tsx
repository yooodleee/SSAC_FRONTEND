export default function ProfileSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      {/* Profile card skeleton */}
      <div className="flex flex-col items-center gap-6 rounded-2xl border border-gray-200 bg-white px-8 py-8 sm:flex-row sm:items-start">
        <div className="h-20 w-20 shrink-0 rounded-full bg-gray-200" />
        <div className="flex-1 space-y-3 text-center sm:text-left">
          <div className="mx-auto h-6 w-32 rounded bg-gray-200 sm:mx-0" />
          <div className="mx-auto h-4 w-48 rounded bg-gray-200 sm:mx-0" />
          <div className="mx-auto h-4 w-64 rounded bg-gray-200 sm:mx-0" />
        </div>
        <div className="h-7 w-16 rounded-full bg-gray-200" />
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-3 gap-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="flex flex-col items-center gap-2 rounded-xl border border-gray-100 bg-white py-4"
          >
            <div className="h-8 w-8 rounded-full bg-gray-200" />
            <div className="h-5 w-16 rounded bg-gray-200" />
            <div className="h-3 w-12 rounded bg-gray-200" />
          </div>
        ))}
      </div>

      {/* History skeleton */}
      <div className="mt-6 space-y-3">
        <div className="h-6 w-32 rounded bg-gray-200" />
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-xl bg-gray-200" />
        ))}
      </div>
    </div>
  );
}
