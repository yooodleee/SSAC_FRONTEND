import type { Metadata } from 'next';
export const metadata: Metadata = { title: '회원가입' };
interface SignupLayoutProps {
  children: React.ReactNode;
}
export default function SignupLayout({ children }: SignupLayoutProps) {
  return <>{children}</>;
}
