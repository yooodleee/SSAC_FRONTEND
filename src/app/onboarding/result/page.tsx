import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { OnboardingResult } from '@/features/onboarding/OnboardingResult';

export const metadata: Metadata = { title: '레벨 결과' };

export default async function OnboardingResultPage() {
  const cookieStore = await cookies();
  if (!cookieStore.has('accessToken')) {
    redirect('/login');
  }

  return <OnboardingResult />;
}
