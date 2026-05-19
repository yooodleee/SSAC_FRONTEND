import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AccountSettings } from '@/features/account/AccountSettings';

export const metadata: Metadata = { title: '계정 관리' };

export default async function AccountSettingsPage() {
  const cookieStore = await cookies();
  if (!cookieStore.has('accessToken')) redirect('/login?redirectTo=/account-settings/');

  return <AccountSettings />;
}
