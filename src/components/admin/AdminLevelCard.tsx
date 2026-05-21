import Image from 'next/image';

interface AdminLevelCardProps {
  nickname: string;
}

export function AdminLevelCard({ nickname }: AdminLevelCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-[#E8E8E8] bg-white px-6 py-5 shadow-sm">
      <Image
        src="/images/admin.png"
        alt="관리자 마스코트"
        width={56}
        height={56}
        className="shrink-0 object-contain"
      />
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="text-base font-semibold text-[#1A1A1A]">{nickname}</span>
          <span className="rounded-full bg-[#1B4332] px-2.5 py-0.5 text-[11px] font-bold text-white tracking-wide">
            ADMIN
          </span>
        </div>
        <span className="text-xs text-gray-400">관리자 계정으로 로그인 중입니다.</span>
      </div>
    </div>
  );
}
