import { Suspense } from 'react';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SignupPageClient } from '@/features/signup/SignupPageClient';

export const metadata: Metadata = { title: '회원가입' };

export default async function SignupPage() {
  const cookieStore = await cookies();
  // 자동 세션 복원(reissue)만 된 경우(loginSource 없음)에는 리다이렉트 하지 않는다.
  // 명시적 로그인을 했을 때만 /home으로 리다이렉트한다.
  if (cookieStore.has('accessToken') && cookieStore.has('loginSource')) redirect('/home');
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <SignupPageClient />
    </Suspense>
  );
}
