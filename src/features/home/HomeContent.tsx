'use client';

/**
 * HomeContent — /home 맞춤 홈 화면 클라이언트 컴포넌트
 *
 * 레이아웃:
 *   [좌측 탭 메뉴] [메인 콘텐츠]
 *   - 레벨 카드 섹션
 *   - 시작 섹션 (카드 3개)
 */

import { SideTabMenu } from '@/features/home/SideTabMenu';
import { LevelCard, LevelCardSkeleton } from '@/features/home/LevelCard';
import { StartSection } from '@/features/home/StartSection';
import { useCurrentUser } from '@/hooks/useCurrentUser';

export function HomeContent() {
  // layout의 LandingHeader와 동일한 authStore 구독 → 재방문 시 캐시 즉시 사용
  const { nickname, level, isLoading } = useCurrentUser(true);

  return (
    <div className="min-h-screen bg-white dark:bg-white">
      <div className="mx-auto max-w-6xl px-4 pt-20 pb-6 sm:px-6 md:pt-28">
        <div className="flex gap-6">
          {/* 좌측 탭 메뉴 */}
          <SideTabMenu />

          {/* 메인 콘텐츠 영역 */}
          <main className="min-w-0 flex-1 pb-20 md:pb-0">
            <div className="space-y-8">
              {/* 레벨 카드 섹션 */}
              <section aria-label="레벨 카드">
                {isLoading ? (
                  <LevelCardSkeleton />
                ) : (
                  <LevelCard nickname={nickname ?? ''} level={level} />
                )}
              </section>

              {/* 시작 섹션 */}
              <StartSection />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
