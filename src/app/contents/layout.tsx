import { cookies } from 'next/headers';
import { LandingHeader } from '@/components/layout/LandingHeader';

interface ContentsLayoutProps {
  children: React.ReactNode;
}

export default async function ContentsLayout({ children }: ContentsLayoutProps) {
  const cookieStore = await cookies();
  const isLoggedIn = cookieStore.has('accessToken');

  return (
    <>
      <LandingHeader isLoggedIn={isLoggedIn} />
      {children}
    </>
  );
}
