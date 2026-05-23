import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { OnboardingTestFlow } from '@/features/onboarding/OnboardingTestFlow';

export const metadata: Metadata = { title: '온보딩 테스트' };

export default async function OnboardingTestPage() {
  const cookieStore = await cookies();
  const isLoggedIn = cookieStore.has('accessToken');

  return <OnboardingTestFlow isLoggedIn={isLoggedIn} />;
}
