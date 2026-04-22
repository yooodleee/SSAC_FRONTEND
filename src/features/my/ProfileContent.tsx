import { cookies } from 'next/headers';
import {
  fetchProfile,
  fetchQuizStats,
  FALLBACK_PROFILE,
  FALLBACK_QUIZ_STATS,
} from '@/services/mypage';
import ProfileCard from './ProfileCard';
import StatsBar from './StatsBar';
import QuizHistorySection from './QuizHistorySection';

export default async function ProfileContent() {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  if (!token) {
    return (
      <>
        <ProfileCard profile={FALLBACK_PROFILE} />
        <StatsBar stats={FALLBACK_QUIZ_STATS} />
        <QuizHistorySection />
      </>
    );
  }

  const [profile, stats] = await Promise.all([fetchProfile(token), fetchQuizStats(token)]);

  return (
    <>
      <ProfileCard profile={profile} />
      <StatsBar stats={stats} />
      <QuizHistorySection />
    </>
  );
}
