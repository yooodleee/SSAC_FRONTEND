import { Suspense } from 'react';
import type { Metadata } from 'next';
import { LoginForm } from './LoginForm';

export const metadata: Metadata = { title: '로그인' };

export default function LoginPage() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-16">
      <div className="w-full max-w-sm">
        <h1 className="mb-2 text-center text-2xl font-bold text-gray-900">로그인</h1>
        <p className="mb-8 text-center text-sm text-gray-500">
          서비스를 이용하려면 로그인이 필요합니다.
        </p>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
