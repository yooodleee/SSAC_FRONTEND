import type { Metadata } from 'next';
import { OnboardingFlow } from '@/features/onboarding/OnboardingFlow';

export const metadata: Metadata = { title: '온보딩' };

export default function OnboardingPage() {
  return <OnboardingFlow />;
}
