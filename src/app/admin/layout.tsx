import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * /admin 레이아웃 — ADMIN 권한 가드
 * - 비로그인: /login?redirectTo=/admin
 * - 로그인이지만 ADMIN 아님: /home
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value ?? null;

  if (!token) {
    redirect('/login?redirectTo=/admin');
  }

  const apiBaseUrl = process.env.API_BASE_URL;
  if (apiBaseUrl) {
    try {
      const res = await fetch(new URL('/api/v1/auth/status', apiBaseUrl).toString(), {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      if (res.ok) {
        const data = (await res.json()) as { isAuthenticated?: boolean; role?: string };
        if (!data.isAuthenticated) redirect('/login?redirectTo=/admin');
        if (data.role !== 'ADMIN') redirect('/home');
      }
    } catch {
      // 네트워크 오류 시 통과 (빌드타임 등)
    }
  }

  return <>{children}</>;
}
