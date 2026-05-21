import { cookies } from 'next/headers';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminLevelCard } from '@/components/admin/AdminLevelCard';

interface AdminHomeData {
  admin?: { nickname?: string; role?: string };
  stats?: { totalUsers?: number; totalFeedbacks?: number };
}

async function getAdminHome(): Promise<AdminHomeData> {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value ?? null;
  const apiBaseUrl = process.env.API_BASE_URL;

  if (!apiBaseUrl) return { admin: { nickname: '관리자', role: 'ADMIN' }, stats: {} };

  try {
    const res = await fetch(new URL('/api/v1/admin/home', apiBaseUrl).toString(), {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: 'no-store',
    });
    if (!res.ok) return {};
    return (await res.json()) as AdminHomeData;
  } catch {
    return {};
  }
}

export default async function AdminPage() {
  const data = await getAdminHome();
  const nickname = data.admin?.nickname ?? '관리자';
  const stats = data.stats;

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl px-4 pt-20 pb-6 sm:px-6 md:pt-28">
        <div className="flex gap-6">
          <AdminSidebar />

          <main className="min-w-0 flex-1 pb-20 md:pb-0">
            <div className="space-y-8">
              {/* 레벨 카드 */}
              <section aria-label="관리자 카드">
                <AdminLevelCard nickname={nickname} />
              </section>

              {/* 통계 카드 */}
              {stats && (
                <section aria-label="관리자 통계">
                  <div className="grid grid-cols-2 gap-4 max-w-md">
                    <div className="rounded-2xl border border-[#E8E8E8] bg-white px-6 py-5 shadow-sm">
                      <p className="mb-1 text-xs text-gray-400">전체 사용자</p>
                      <p className="text-2xl font-bold text-[#1B4332]">
                        {(stats.totalUsers ?? 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-[#E8E8E8] bg-white px-6 py-5 shadow-sm">
                      <p className="mb-1 text-xs text-gray-400">전체 피드백</p>
                      <p className="text-2xl font-bold text-[#1B4332]">
                        {(stats.totalFeedbacks ?? 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </section>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
