import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SideTabMenu } from '@/features/home/SideTabMenu';
import { AccountSettings } from '@/features/account/AccountSettings';

export const metadata: Metadata = { title: '계정 관리' };

export default async function HomeAccountSettingsPage() {
  const cookieStore = await cookies();
  if (!cookieStore.has('accessToken')) redirect('/login?redirectTo=/home/account-settings');

  return (
    <div className="min-h-screen bg-white dark:bg-white">
      <div className="mx-auto max-w-6xl px-4 pt-20 pb-6 sm:px-6 md:pt-28">
        <div className="flex gap-6">
          <SideTabMenu />
          <main className="min-w-0 flex-1 pb-20 md:pb-0">
            <AccountSettings />
          </main>
        </div>
      </div>
    </div>
  );
}
