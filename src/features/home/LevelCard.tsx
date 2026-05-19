'use client';

/**
 * LevelCard — 레벨 카드 섹션
 *
 * - 카드 배경 이미지: 레벨에 따라 분기
 * - 반투명 오버레이(rgba 0,0,0,0.35) 위에 Hi {닉네임}! 텍스트
 * - 이미지 로딩 실패 시 그라디언트 폴백
 */

import Image from 'next/image';
import { useState } from 'react';

interface LevelCardProps {
  nickname: string;
  level: string | null;
}

const LEVEL_CONFIG: Record<string, { label: string; gradient: string; imagePath: string }> = {
  SEED: {
    label: '씨앗',
    gradient: 'from-green-700 to-green-500',
    imagePath: '/images/level-seed.png',
  },
  SPROUT: {
    label: '새싹',
    gradient: 'from-emerald-600 to-teal-400',
    imagePath: '/images/level-sprout.png',
  },
  TREE: {
    label: '나무',
    gradient: 'from-green-900 to-green-600',
    imagePath: '/images/level-tree.png',
  },
};

const DEFAULT_CONFIG = {
  label: '온보딩 미완료',
  gradient: 'from-gray-700 to-gray-500',
  imagePath: '/images/hello.png',
};

export function LevelCard({ nickname, level }: LevelCardProps) {
  const config = level && LEVEL_CONFIG[level] ? LEVEL_CONFIG[level] : DEFAULT_CONFIG;
  const [imgError, setImgError] = useState(false);

  return (
    <div className="relative overflow-hidden rounded-2xl" style={{ minHeight: '160px' }}>
      {/* 배경: 이미지 또는 그라디언트 폴백 */}
      {!imgError ? (
        <Image
          src={config.imagePath}
          alt={`${config.label} 레벨 배경`}
          fill
          className="object-cover"
          onError={() => setImgError(true)}
          priority
        />
      ) : (
        <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient}`} />
      )}

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
        {level && (
          <span className="self-start rounded-full bg-white/20 px-3 py-1 text-sm font-medium text-white backdrop-blur-sm">
            {level}
          </span>
        )}
      </div>
    </div>
  );
}

/** 스켈레톤 */
export function LevelCardSkeleton() {
  return <div className="h-[160px] animate-pulse rounded-2xl bg-gray-200 dark:bg-slate-700" />;
}
