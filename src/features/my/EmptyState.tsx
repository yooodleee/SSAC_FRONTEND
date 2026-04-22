interface EmptyStateProps {
  title?: string;
  description?: string;
}

export default function EmptyState({
  title = '퀴즈 기록이 없습니다',
  description = '첫 번째 퀴즈에 도전해 보세요!',
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 py-16 text-center">
      <div className="mb-4 text-5xl" role="img" aria-label="기록 없음">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
          <line x1="8" y1="11" x2="16" y2="11"></line>
          <line x1="8" y1="16" x2="16" y2="16"></line>
        </svg>
      </div>
      <p className="mb-1 font-semibold text-gray-700">{title}</p>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
  );
}
