import type { Metadata } from 'next';
import { SignupProgress } from '@/features/signup/SignupProgress';
import { TypeSelection } from '@/features/signup/TypeSelection';

export const metadata: Metadata = { title: '유형 선택' };

export default function TypePage() {
  return (
    <>
      <SignupProgress currentStep="type" />
      <TypeSelection />
    </>
  );
}
