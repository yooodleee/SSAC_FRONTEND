import type { QuizStats } from '@/types';

interface StatsBarProps {
  stats: QuizStats;
}

function IconAttempts() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6 text-blue-500"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
      />
    </svg>
  );
}

function IconAccuracy() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6 text-green-500"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function IconScore() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6 text-yellow-500"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
      />
    </svg>
  );
}

const STAT_ITEMS = [
  {
    key: 'totalAttempts' as const,
    label: '총 시도',
    format: (v: number) => `${v.toLocaleString()}회`,
    Icon: IconAttempts,
  },
  {
    key: 'accuracyRate' as const,
    label: '정답률',
    format: (v: number) => `${v}%`,
    Icon: IconAccuracy,
  },
  {
    key: 'averageScore' as const,
    label: '평균 점수',
    format: (v: number) => `${v}점`,
    Icon: IconScore,
  },
];

export default function StatsBar({ stats }: StatsBarProps) {
  return (
    <div className="mt-4 grid grid-cols-3 gap-3">
      {STAT_ITEMS.map((item) => (
        <div
          key={item.key}
          className="flex flex-col items-center gap-1 rounded-xl border border-gray-100 bg-white py-4 shadow-sm"
        >
          <item.Icon />
          <span className="text-lg font-bold text-gray-900">{item.format(stats[item.key])}</span>
          <span className="text-xs text-gray-500">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
