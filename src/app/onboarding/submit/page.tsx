import type { Metadata } from 'next';
import { OnboardingSubmit } from '@/features/onboarding/OnboardingSubmit';

export const metadata: Metadata = { title: '온보딩 결과 처리 중' };

export default function OnboardingSubmitPage() {
  return <OnboardingSubmit />;
}
