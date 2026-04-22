import type { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import ProfileContent from '@/features/my/ProfileContent';
import ProfileSkeleton from '@/features/my/ProfileSkeleton';

export const metadata: Metadata = { title: '내 정보 | 마이페이지' };

export default function ProfilePage() {
  return (
    <div className="container-page py-8">
      <div className="mb-6 flex items-center gap-2 text-sm text-gray-500">
        <Link href="/my" className="hover:text-gray-700">
          마이페이지
        </Link>
        <span aria-hidden="true">/</span>
        <span className="font-medium text-gray-900">내 정보</span>
      </div>

      <Suspense fallback={<ProfileSkeleton />}>
        <ProfileContent />
      </Suspense>
    </div>
  );
}
