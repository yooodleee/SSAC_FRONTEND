'use client';

/**
 * TechSection — 네 번째 섹션: TECH (Coming Soon)
 *
 * - 섹션 공간만 마련
 * - 향후 멤버 카드/개발 회고 콘텐츠 추가 가능한 확장 가능 구조
 * - Intersection Observer 기반 fade-in
 */

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

// 향후 멤버 카드 데이터를 이 타입으로 확장
export interface TechMember {
  name: string;
  role: string;
  bio?: string;
  avatarUrl?: string;
}

interface TechSectionProps {
  // 향후 멤버 데이터 전달 가능
  members?: TechMember[];
}

export function TechSection({ members }: TechSectionProps) {
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      id="tech"
      ref={sectionRef}
      aria-label="TECH 섹션"
      className={cn(
        'flex min-h-[400px] flex-col items-center justify-center bg-gray-900 px-4 py-20 text-center',
        'transition-all duration-700 motion-reduce:transition-none motion-reduce:translate-y-0 motion-reduce:opacity-100',
        visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0',
      )}
    >
      <h2 className="mb-3 font-bold text-white" style={{ fontSize: '28px', lineHeight: '1.3' }}>
        TECH
      </h2>
      <p className="mb-8 text-gray-400" style={{ fontSize: '15px', lineHeight: '1.6' }}>
        멤버 카드 및 개발 회고 공간
      </p>

      {/* 멤버 카드 영역 (향후 확장) */}
      {members && members.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((member) => (
            <div key={member.name} className="rounded-xl bg-gray-800 p-6 text-left">
              <p className="font-semibold text-white">{member.name}</p>
              <p className="text-sm text-gray-400">{member.role}</p>
              {member.bio && <p className="mt-2 text-sm text-gray-500">{member.bio}</p>}
            </div>
          ))}
        </div>
      ) : (
        <div
          className="inline-flex items-center gap-2 rounded-full border border-gray-700 px-6 py-3 text-gray-500"
          style={{ fontSize: '14px' }}
        >
          🌱 Coming Soon...
        </div>
      )}
    </section>
  );
}
