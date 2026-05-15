'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { mypageV1Service, type MyPageResponse } from '@/services/mypageV1';
import { Button } from '@/components/ui/Button';
import { MyPageSkeleton } from './MyPageSkeleton';
import { ProfileSection } from './ProfileSection';
import { LevelSection } from './LevelSection';
import { StatsSection } from './StatsSection';
import { InterestSection } from './InterestSection';
import { LogoutSection } from './LogoutSection';
import { RetakeConfirmDialog } from './RetakeConfirmDialog';

export function MyPageV1() {
  const router = useRouter();

  const [data, setData] = useState<MyPageResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [retakeOpen, setRetakeOpen] = useState(false);
  const [retakeLoading, setRetakeLoading] = useState(false);
  const [retakeError, setRetakeError] = useState<string | null>(null);

  const fetchedRef = useRef(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const res = await mypageV1Service.getMyPage();
      setData(res.data ?? null);
    } catch (err) {
      const error = err as { status?: number; loginRequired?: boolean };
      if (error.loginRequired || error.status === 401) {
        router.replace('/login?redirectTo=/mypage');
        return;
      }
      setFetchError('정보를 불러오지 못했어요. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    loadData();
  }, [loadData]);

  async function handleRetakeConfirm() {
    setRetakeLoading(true);
    setRetakeError(null);
    try {
      await mypageV1Service.deleteOnboardingResult();
      setRetakeOpen(false);
      router.push('/onboarding/test');
    } catch {
      setRetakeError('오류가 발생했어요. 잠시 후 다시 시도해주세요.');
    } finally {
      setRetakeLoading(false);
    }
  }

  function handleNicknameUpdated(nickname: string) {
    setData((prev) => (prev ? { ...prev, nickname } : prev));
  }

  // ─── 로딩 ───────────────────────────────────────────────────────────────────
  if (isLoading) return <MyPageSkeleton />;

  // ─── 에러 ───────────────────────────────────────────────────────────────────
  if (fetchError || !data) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <p className="text-[var(--color-text-secondary)]">
          {fetchError ?? '정보를 불러오지 못했어요.'}
        </p>
        <Button
          variant="secondary"
          onClick={() => {
            fetchedRef.current = false;
            loadData();
          }}
        >
          다시 시도
        </Button>
      </div>
    );
  }

  // ─── 메인 UI ────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="flex flex-col gap-4">
        {/* 1. 프로필 정보 */}
        <ProfileSection data={data} onNicknameUpdated={handleNicknameUpdated} />

        {/* 2. 나의 레벨 */}
        <LevelSection data={data} onRetake={() => setRetakeOpen(true)} />

        {/* 3. 학습 통계 */}
        <StatsSection data={data} />

        {/* 4. 관심 도메인 설정 */}
        <InterestSection data={data} />

        {/* 5. 온보딩 재응시 — LevelSection의 버튼과 중복이므로 섹션 형태로 노출 */}
        <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4">
          <button
            type="button"
            onClick={() => setRetakeOpen(true)}
            className="w-full rounded-xl border border-[var(--color-border)] py-3 text-sm font-medium text-[var(--color-text-secondary)] transition-colors hover:border-[#4CAF82] hover:text-[#4CAF82] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4CAF82] focus-visible:ring-offset-1"
          >
            온보딩 재응시
          </button>
        </section>

        {/* 6. 로그아웃 */}
        <LogoutSection />
      </div>

      {/* 온보딩 재응시 확인 다이얼로그 */}
      <RetakeConfirmDialog
        open={retakeOpen}
        isLoading={retakeLoading}
        error={retakeError}
        onConfirm={() => void handleRetakeConfirm()}
        onCancel={() => {
          setRetakeOpen(false);
          setRetakeError(null);
        }}
      />
    </>
  );
}
