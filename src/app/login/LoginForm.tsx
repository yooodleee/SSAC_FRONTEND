'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') ?? '/';
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      await fetch('/api/auth/login', { method: 'POST' });
      router.push(redirectTo);
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
      <p className="mb-6 text-center text-xs text-gray-400">
        현재 목 로그인입니다. 버튼 클릭 시 인증 쿠키가 설정됩니다.
      </p>
      <Button className="w-full" onClick={handleLogin} isLoading={isLoading}>
        로그인
      </Button>
    </div>
  );
}
