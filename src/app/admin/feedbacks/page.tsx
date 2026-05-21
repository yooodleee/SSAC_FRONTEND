import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { FeedbackList } from '@/components/admin/FeedbackList';

export default function AdminFeedbacksPage() {
  return (
    <div className="flex min-h-screen bg-[#F9F9F9]">
      <AdminSidebar />

      <main className="flex-1 px-8 py-8">
        <h1 className="mb-6 text-xl font-bold text-[#1A1A1A]">피드백 관리</h1>
        <FeedbackList />
      </main>
    </div>
  );
}
