import type { Metadata } from 'next';
import { SignupProgress } from '@/features/signup/SignupProgress';
import { NicknameSetup } from '@/features/signup/NicknameSetup';
export const metadata: Metadata = { title: '닉네임 설정' };
export default function NicknamePage() {
  return (
    <>
      <SignupProgress currentStep="nickname" />
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">닉네임 설정</h1>
        <p className="mt-1 text-sm text-gray-500">서비스에서 사용할 닉네임을 입력해주세요.</p>
      </div>
      <NicknameSetup />
    </>
  );
}
