'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { components } from '@/../api-contract/generated/api-types';
import { onboardingService, type OnboardingResultBffResponse } from '@/services/onboarding';
import { getErrorMessage } from '@/lib/errorMessages';
import { toastStore } from '@/lib/toastStore';
import { Button } from '@/components/ui/Button';
import { LevelMascot } from './LevelMascot';
import { DomainCard } from './DomainCard';
import { OnboardingResultSkeleton } from './OnboardingResultSkeleton';

type Level = 'SEED' | 'SPROUT' | 'TREE';
type RecommendedDomainDto = components['schemas']['RecommendedDomainDto'];

const MAX_DOMAINS = 3;

const LEVEL_INFO: Record<Level, { titleSuffix: string; fallbackDesc: string }> = {
  SEED: {
    titleSuffix: '금융 씨앗이에요!',
    fallbackDesc: '금융이 완전 처음이어도 괜찮아요.\nSSAC이 처음부터 차근차근 알려드릴게요',
  },
  SPROUT: {
    titleSuffix: '금융 새싹이에요!',
    fallbackDesc: '조금은 알고 있어요.\nSSAC과 함께 더 깊이 알아봐요',
  },
  TREE: {
    titleSuffix: '금융 나무예요!',
    fallbackDesc: '어느 정도 알고 있어요.\nSSAC과 함께 전문가로 성장해봐요',
  },
};

const SKIPPED_DESC = '기본 레벨(씨앗)로 시작할게요.\n마이페이지에서 언제든 테스트할 수 있어요 😊';

export function OnboardingResult() {
  const router = useRouter();

  const [result, setResult] = useState<OnboardingResultBffResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const fetchedRef = useRef(false);

  const loadResult = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const data = await onboardingService.getResult();
      setResult(data);
    } catch (err) {
      const error = err as { code?: string; loginRequired?: boolean; status?: number };

      if (error.loginRequired || error.status === 401) {
        router.replace('/login');
        return;
      }
      // 온보딩 미완료 → 테스트 페이지로
      if (error.status === 404 || error.code === 'ONBOARDING-006') {
        router.replace('/onboarding/test');
        return;
      }
      // 이미 관심 도메인까지 완료 → 홈으로
      if (error.code === 'ONBOARDING-002') {
        router.replace('/home');
        return;
      }
      setFetchError('결과를 불러오지 못했어요. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    loadResult();
  }, [loadResult]);

  function handleDomainToggle(domainId: string) {
    setSelectedIds((prev) => {
      if (prev.includes(domainId)) {
        return prev.filter((id) => id !== domainId);
      }
      if (prev.length >= MAX_DOMAINS) {
        toastStore.show(`최대 ${MAX_DOMAINS}개까지 선택할 수 있어요`);
        return prev;
      }
      return [...prev, domainId];
    });
  }

  async function handleSubmit() {
    if (selectedIds.length === 0 || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await onboardingService.saveInterests({ domainIds: selectedIds });
      // 히스토리 스택에서 결과 페이지를 제거하며 홈으로 이동
      router.replace('/home');
    } catch (err) {
      const error = err as { code?: string };
      setSubmitError(getErrorMessage(error.code));
      setIsSubmitting(false);
    }
  }

  // ─── 로딩 / 에러 상태 ────────────────────────────────────────────────────

  if (isLoading) return <OnboardingResultSkeleton />;

  if (fetchError) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <p className="text-[var(--color-text-secondary)]">{fetchError}</p>
        <Button
          variant="secondary"
          onClick={() => {
            fetchedRef.current = false;
            loadResult();
          }}
        >
          다시 시도
        </Button>
      </div>
    );
  }

  if (!result) return null;

  // ─── 레벨 정보 계산 ──────────────────────────────────────────────────────

  const level = (result.level as Level) ?? 'SEED';
  const levelCfg = LEVEL_INFO[level] ?? LEVEL_INFO.SEED;
  const nickname = result.nickname;
  const title = nickname ? `${nickname}님은 ${levelCfg.titleSuffix}` : levelCfg.titleSuffix;
  const description = result.skipped
    ? SKIPPED_DESC
    : (result.levelDescription ?? levelCfg.fallbackDesc);

  const domains: RecommendedDomainDto[] = (result.recommendedDomains ?? []).slice(0, MAX_DOMAINS);

  // ─── 메인 UI ─────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-6">
      {/* 마스코트 영역 */}
      <div className="flex flex-col items-center gap-4 py-4">
        <LevelMascot level={level} />

        <div className="flex flex-col items-center gap-1 text-center">
          <p className="text-xl font-bold text-[var(--color-text-primary)]">{title}</p>
          <p className="whitespace-pre-line text-sm leading-relaxed text-[var(--color-text-secondary)]">
            {description}
          </p>
        </div>
      </div>

      <hr className="border-[var(--color-border)]" />

      {/* 관심 도메인 선택 */}
      <div className="flex flex-col gap-4">
        <div>
          <p className="font-semibold text-[var(--color-text-primary)]">
            지금 가장 궁금한 게 뭔가요?
          </p>
          <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
            1~{MAX_DOMAINS}개 선택 가능
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {domains.map((domain) => {
            const id = domain.id ?? '';
            return (
              <DomainCard
                key={id}
                id={id}
                emoji={domain.emoji ?? ''}
                name={domain.name ?? ''}
                reason={domain.reason ?? ''}
                selected={selectedIds.includes(id)}
                disabled={selectedIds.length >= MAX_DOMAINS}
                onClick={() => handleDomainToggle(id)}
              />
            );
          })}
        </div>
      </div>

      {/* 제출 에러 */}
      {submitError && (
        <p role="alert" className="text-center text-sm text-[var(--color-danger)]">
          {submitError}
        </p>
      )}

      {/* 시작하기 버튼 */}
      <Button
        size="lg"
        className="w-full rounded-xl bg-[#4CAF82] text-white hover:bg-[#388E60]"
        disabled={selectedIds.length === 0 || isSubmitting}
        isLoading={isSubmitting}
        onClick={handleSubmit}
      >
        시작하기 →
      </Button>
    </div>
  );
}
