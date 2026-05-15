import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { MyPageV1 } from '@/features/mypage/MyPageV1';

export const metadata: Metadata = { title: '마이페이지' };

export default async function MyPage() {
  const cookieStore = await cookies();
  const isLoggedIn = cookieStore.has('accessToken');

  if (!isLoggedIn) {
    redirect('/login?redirectTo=/mypage');
  }

  return (
    <div className="mx-auto max-w-[390px] px-5 py-8 md:max-w-xl md:px-10">
      <h1 className="mb-6 text-xl font-bold text-[var(--color-text-primary)]">마이페이지</h1>
      <MyPageV1 />
    </div>
  );
}
