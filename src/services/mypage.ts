import type { BackendResponse, QuizStats, UserProfile } from '@/types';
import { apiClient } from './api';

function authHeaders(token: string): { Authorization: string } {
  return { Authorization: `Bearer ${token}` };
}

export const FALLBACK_PROFILE: UserProfile = {
  id: 0,
  email: 'test@example.com',
  nickname: '테스트',
  createdAt: new Date().toISOString(),
};

export const FALLBACK_QUIZ_STATS: QuizStats = {
  totalScore: 7700,
  totalAttempts: 100,
  averageScore: 77,
  totalCorrect: 67,
  totalQuestions: 100,
  accuracyRate: 67,
  periodStats: [],
};

export async function fetchProfile(token: string): Promise<UserProfile> {
  const res = await apiClient.get<BackendResponse<UserProfile>>('/api/v1/users/me', {
    headers: authHeaders(token),
  });
  return res.data;
}

export async function fetchQuizStats(token: string): Promise<QuizStats> {
  const res = await apiClient.get<BackendResponse<QuizStats>>('/api/v1/quiz-attempts/stats', {
    headers: authHeaders(token),
  });
  return res.data;
}
