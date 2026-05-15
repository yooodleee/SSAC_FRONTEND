import type { Metadata } from 'next';
import { OnboardingResult } from '@/features/onboarding/OnboardingResult';

export const metadata: Metadata = { title: '레벨 결과' };

export default function OnboardingResultPage() {
  return (
    <div className="mx-auto max-w-[390px] px-5 py-8">
      <OnboardingResult />
    </div>
  );
}
