import { apiClient } from './api';
import type { components } from '@/../api-contract/generated/api-types';

type MyPageResponse = components['schemas']['MyPageResponse'];
type ApiResponseMyPageResponse = components['schemas']['ApiResponseMyPageResponse'];

export const mypageV1Service = {
  getMyPage(): Promise<ApiResponseMyPageResponse> {
    return apiClient.get<ApiResponseMyPageResponse>('/api/v1/users/mypage');
  },

  updateInterests(domainIds: string[]): Promise<void> {
    return apiClient.put<void>('/api/v1/users/interests', { domainIds });
  },

  updateNickname(nickname: string): Promise<void> {
    return apiClient.patch<void>('/api/v1/users/me/nickname', { nickname });
  },

  deleteOnboardingResult(): Promise<void> {
    return apiClient.delete<void>('/api/v1/onboarding/result');
  },
};

export type { MyPageResponse };
