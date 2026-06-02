import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { OnboardingFlow } from '@/features/onboarding/OnboardingFlow';

export const metadata: Metadata = { title: '온보딩' };

export default async function OnboardingPage() {
  const cookieStore = await cookies();
  // 자동 세션 복원(reissue)과 명시적 로그인을 구분:
  // loginSource 쿠키는 사용자가 직접 로그인할 때만 설정되며, 세션 쿠키이므로 브라우저 종료 시 삭제됨
  const isLoggedIn = cookieStore.has('accessToken') && cookieStore.has('loginSource');

  return <OnboardingFlow isLoggedIn={isLoggedIn} />;
}
