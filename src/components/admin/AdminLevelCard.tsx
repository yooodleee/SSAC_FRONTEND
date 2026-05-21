import Image from 'next/image';

interface AdminLevelCardProps {
  nickname: string;
}

export function AdminLevelCard({ nickname }: AdminLevelCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl" style={{ minHeight: '160px' }}>
      {/* 배경 이미지 */}
      <Image src="/images/admin.png" alt="관리자 배경" fill className="object-cover" priority />

      {/* 반투명 오버레이 */}
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(0, 0, 0, 0.35)' }}
        aria-hidden="true"
      />

      {/* 콘텐츠 */}
      <div className="relative z-10 flex h-full min-h-[160px] flex-col justify-between p-6">
        <p className="font-bold text-white" style={{ fontSize: '28px', lineHeight: 1.3 }}>
          Hi {nickname}!
        </p>
        <span className="self-start rounded-full bg-white/20 px-3 py-1 text-sm font-medium text-white backdrop-blur-sm">
          ADMIN
        </span>
      </div>
    </div>
  );
}
