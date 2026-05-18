import type { Metadata } from 'next';
import { SignupProgress } from '@/features/signup/SignupProgress';
import { TermsAgreement } from '@/features/signup/TermsAgreement';
export const metadata: Metadata = { title: '약관 동의' };
export default function TermsPage() {
  return (
    <>
      <SignupProgress currentStep="terms" />
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">서비스 이용 약관</h1>
        <p className="mt-1 text-sm text-gray-500">서비스 이용을 위해 약관에 동의해주세요.</p>
      </div>
      <TermsAgreement />
    </>
  );
}
