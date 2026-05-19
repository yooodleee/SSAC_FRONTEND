import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SideTabMenu } from '@/features/home/SideTabMenu';

export const metadata: Metadata = { title: '내가 본 콘텐츠' };

export default async function ContentHistoryPage() {
  const cookieStore = await cookies();
  if (!cookieStore.has('accessToken')) redirect('/login');

  return (
    <div className="min-h-screen bg-white dark:bg-white">
      <div className="mx-auto max-w-6xl px-4 pt-20 pb-6 sm:px-6 md:pt-28">
        <div className="flex gap-6">
          <SideTabMenu />
          <main className="min-w-0 flex-1 pb-20 md:pb-0">
            <h1
              className="mb-4 font-bold text-[#1A1A1A]"
              style={{ fontSize: '28px', lineHeight: 1.3 }}
            >
              내가 본 콘텐츠
            </h1>
            <p className="text-sm text-[#6B6B6B]">추후 추가 예정</p>
          </main>
        </div>
      </div>
    </div>
  );
}
