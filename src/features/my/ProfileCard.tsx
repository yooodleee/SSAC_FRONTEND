import type { UserProfile } from '@/types';
import { formatDate } from '@/lib/utils';

interface ProfileCardProps {
  profile: UserProfile;
}

export default function ProfileCard({ profile }: ProfileCardProps) {
  const initials = profile.nickname.slice(0, 2);

  return (
    <div className="flex flex-col items-center gap-6 rounded-2xl border border-gray-200 bg-white px-8 py-8 shadow-sm sm:flex-row sm:items-start">
      <div
        className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white"
        aria-hidden="true"
      >
        {initials}
      </div>

      <div className="flex-1 text-center sm:text-left">
        <h2 className="text-xl font-bold text-gray-900">{profile.nickname}</h2>
        <p className="mt-1 text-sm text-gray-500">{profile.email}</p>
        <p className="mt-3 text-xs text-gray-400">가입일 {formatDate(profile.createdAt)}</p>
      </div>
    </div>
  );
}
