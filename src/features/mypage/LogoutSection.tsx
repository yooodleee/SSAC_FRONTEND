'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export function LogoutSection() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4">
      <button
        type="button"
        onClick={() => void handleLogout()}
        disabled={loading}
        className={cn(
          'w-full rounded-xl py-3 text-sm font-medium text-[var(--color-danger)]',
          'transition-colors hover:bg-red-50 dark:hover:bg-red-900/20',
          'disabled:cursor-not-allowed disabled:opacity-60',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-danger)] focus-visible:ring-offset-1',
        )}
      >
        {loading ? '로그아웃 중...' : '로그아웃'}
      </button>
    </section>
  );
}
