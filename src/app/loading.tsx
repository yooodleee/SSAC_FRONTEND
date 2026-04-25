export default function Loading() {
  return (
    <div className="container-page flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
        <p className="text-sm text-gray-500">페이지를 불러오는 중...</p>
      </div>
    </div>
  );
}
