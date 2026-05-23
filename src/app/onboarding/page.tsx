import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { OnboardingFlow } from '@/features/onboarding/OnboardingFlow';

export const metadata: Metadata = { title: '온보딩' };

export default async function OnboardingPage() {
  const cookieStore = await cookies();
  const isLoggedIn = cookieStore.has('accessToken');

  return <OnboardingFlow isLoggedIn={isLoggedIn} />;
}
