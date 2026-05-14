import type { Metadata } from 'next';
import { OnboardingTest } from '@/features/onboarding/OnboardingTest';

export const metadata: Metadata = { title: '온보딩 테스트' };

export default function OnboardingTestPage() {
  return (
    <div className="mx-auto max-w-[390px] px-5 py-8">
      <OnboardingTest />
    </div>
  );
}
