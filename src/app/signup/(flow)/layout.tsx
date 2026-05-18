import type { Metadata } from 'next';
export const metadata: Metadata = { title: '회원가입' };
interface SignupLayoutProps {
  children: React.ReactNode;
}
export default function SignupFlowLayout({ children }: SignupLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white px-6 pb-8 pt-6 shadow-sm ring-1 ring-gray-100">
        {children}
      </div>
    </div>
  );
}
