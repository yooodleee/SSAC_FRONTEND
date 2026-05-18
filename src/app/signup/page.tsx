import { Suspense } from 'react';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SignupPageClient } from '@/features/signup/SignupPageClient';

export const metadata: Metadata = { title: '회원가입' };

export default async function SignupPage() {
  const cookieStore = await cookies();
  if (cookieStore.has('accessToken')) redirect('/home');
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <SignupPageClient />
    </Suspense>
  );
}
