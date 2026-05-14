import type { components } from '@/../api-contract/generated/api-types';

type OnboardingQuestionsResponse = components['schemas']['OnboardingQuestionsResponse'];
type OnboardingSubmitRequest = components['schemas']['OnboardingSubmitRequest'];
type OnboardingSubmitResponse = components['schemas']['OnboardingSubmitResponse'];
type OnboardingSkipResponse = components['schemas']['OnboardingSkipResponse'];

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
};
