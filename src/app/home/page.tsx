import type { Metadata } from 'next';
import { HomeV1 } from '@/features/home/HomeV1';

export const metadata: Metadata = { title: '홈' };

export default function HomePage() {
  return (
    <div className="mx-auto max-w-[390px] px-5 py-6 md:max-w-[768px] md:px-8">
      <HomeV1 />
    </div>
  );
}
