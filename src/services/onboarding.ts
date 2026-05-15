import type { components } from '@/../api-contract/generated/api-types';

type OnboardingQuestionsResponse = components['schemas']['OnboardingQuestionsResponse'];
type OnboardingSubmitRequest = components['schemas']['OnboardingSubmitRequest'];
type OnboardingSubmitResponse = components['schemas']['OnboardingSubmitResponse'];
type OnboardingSkipResponse = components['schemas']['OnboardingSkipResponse'];
type OnboardingResultResponse = components['schemas']['OnboardingResultResponse'];
type OnboardingInterestsRequest = components['schemas']['OnboardingInterestsRequest'];

// UI-only type: BFF layer extension — BE contract에 없는 nickname 필드를 FE에서 병합
export type OnboardingResultBffResponse = OnboardingResultResponse & { nickname?: string };

async function onboardingFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers as Record<string, string> | undefined),
    },
  });

  let json: Record<string, unknown>;
  try {
    json = (await res.json()) as Record<string, unknown>;
  } catch {
    throw Object.assign(new Error(`HTTP ${res.status}`), { status: res.status });
  }

  if (!res.ok || json['success'] === false) {
    throw Object.assign(
      new Error((json['message'] as string | undefined) ?? `HTTP ${res.status}`),
      {
        status: res.status,
        code: (json['errorCode'] ?? json['code']) as string | undefined,
        loginRequired: json['loginRequired'] as boolean | undefined,
      },
    );
  }

  // BE wraps response in { success: true, data: ... }
  return (json['data'] ?? json) as T;
}

export const onboardingService = {
  getQuestions(): Promise<OnboardingQuestionsResponse> {
    return onboardingFetch<OnboardingQuestionsResponse>('/api/v1/onboarding/questions');
  },

  submitAnswers(body: OnboardingSubmitRequest): Promise<OnboardingSubmitResponse> {
    return onboardingFetch<OnboardingSubmitResponse>('/api/v1/onboarding/submit', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  skipOnboarding(): Promise<OnboardingSkipResponse> {
    return onboardingFetch<OnboardingSkipResponse>('/api/v1/onboarding/skip', {
      method: 'POST',
    });
  },

  getResult(): Promise<OnboardingResultBffResponse> {
    return onboardingFetch<OnboardingResultBffResponse>('/api/v1/onboarding/result');
  },

  saveInterests(body: OnboardingInterestsRequest): Promise<void> {
    return onboardingFetch<void>('/api/v1/onboarding/interests', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },
};
