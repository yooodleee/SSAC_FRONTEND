import { cookies } from 'next/headers';
import { LandingHeader } from '@/components/layout/LandingHeader';

export default async function HomeLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const isLoggedIn = cookieStore.has('accessToken');

  return (
    <>
      <LandingHeader isLoggedIn={isLoggedIn} />
      {children}
    </>
  );
}
