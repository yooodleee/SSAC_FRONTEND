import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { FeedbackList } from '@/components/admin/FeedbackList';

export default function AdminFeedbacksPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl px-4 pt-20 pb-6 sm:px-6 md:pt-28">
        <div className="flex gap-6">
          <AdminSidebar />

          <main className="min-w-0 flex-1 pb-20 md:pb-0">
            <FeedbackList />
          </main>
        </div>
      </div>
    </div>
  );
}
