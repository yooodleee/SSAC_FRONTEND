import Link from 'next/link';
import type { Metadata } from 'next';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = { title: '접근 불가' };

export default function ForbiddenPage() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <p className="mb-2 text-6xl font-bold text-gray-200">403</p>
      <h2 className="mb-3 text-2xl font-semibold text-gray-900">접근 권한이 없습니다</h2>
      <p className="mb-8 text-gray-500">이 페이지에 접근할 수 있는 권한이 없습니다.</p>
      <Link href="/">
        <Button>홈으로 돌아가기</Button>
      </Link>
    </div>
  );
}
