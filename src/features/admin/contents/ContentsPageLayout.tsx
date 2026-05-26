'use client';

import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { ContentList } from './ContentList';

export function ContentsPageLayout() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-[1400px] px-4 pt-20 pb-6 sm:px-6 md:pt-28">
        <div className="flex gap-6">
          <AdminSidebar />
          <main className="min-w-0 flex-1 overflow-hidden pb-20 md:pb-0">
            <h1 className="mb-4 text-xl font-bold text-[#1A1A1A]">콘텐츠 관리</h1>
            <ContentList />
          </main>
        </div>
      </div>
    </div>
  );
}
