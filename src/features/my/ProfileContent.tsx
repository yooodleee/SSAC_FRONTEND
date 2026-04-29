import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { fetchProfile, fetchQuizStats, FALLBACK_QUIZ_STATS } from '@/services/mypage';
import type { ApiError } from '@/types';
import ProfileCard from './ProfileCard';
import StatsBar from './StatsBar';
import QuizHistorySection from './QuizHistorySection';

export default async function ProfileContent() {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;

  if (!token) {
    redirect('/login?redirectTo=/my/profile');
  }

  let profile;
  let stats;

  try {
    [profile, stats] = await Promise.all([fetchProfile(token), fetchQuizStats(token)]);
  } catch (err) {
    const apiErr = err as Partial<ApiError>;

    if (apiErr.status === 401) {
      redirect('/login?error=SESSION_EXPIRED');
    }
    if (apiErr.status === 403) {
      redirect('/forbidden');
    }

    return (
      <div
        role="alert"
        className="rounded-xl border border-red-100 bg-red-50 px-6 py-8 text-center text-sm text-red-600"
      >
        프로필 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.
      </div>
    );
  }

  return (
    <>
      <ProfileCard profile={profile} />
      <StatsBar stats={stats ?? FALLBACK_QUIZ_STATS} />
      <QuizHistorySection />
    </>
  );
}
