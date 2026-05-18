import { Suspense } from 'react';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { LoginPageClient } from './LoginPageClient';

export const metadata: Metadata = { title: '로그인' };

export default async function LoginPage() {
  const cookieStore = await cookies();
  if (cookieStore.has('accessToken')) redirect('/home');

  return (
    <Suspense fallback={<div className="flex min-h-screen bg-white" />}>
      <LoginPageClient />
    </Suspense>
  );
}
