import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { HomeContent } from '@/features/home/HomeContent';

export const metadata: Metadata = { title: '홈' };

export default async function HomePage() {
  const cookieStore = await cookies();
  if (!cookieStore.has('accessToken')) redirect('/login');

  return <HomeContent />;
}
