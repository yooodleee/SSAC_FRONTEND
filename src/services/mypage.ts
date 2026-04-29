import type { QuizStats, UserProfile } from '@/types';

function authHeaders(token: string): { Authorization: string } {
  return { Authorization: `Bearer ${token}` };
}

export const FALLBACK_QUIZ_STATS: QuizStats = {
  totalScore: 7700,
  totalAttempts: 100,
  averageScore: 77,
  totalCorrect: 67,
  totalQuestions: 100,
  accuracyRate: 67,
  periodStats: [],
};

function apiBaseUrl(): string {
  const url = process.env.API_BASE_URL;
  if (!url) throw new Error('Missing API_BASE_URL');
  return url;
}

export async function fetchProfile(token: string): Promise<UserProfile> {
  const res = await fetch(`${apiBaseUrl()}/api/v1/users/me`, {
    headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
    cache: 'no-store',
  });

  if (!res.ok) {
    const err = { message: `HTTP ${res.status}`, status: res.status };
    throw err;
  }

  const body = (await res.json()) as { data: UserProfile };
  return body.data;
}

export async function fetchQuizStats(token: string): Promise<QuizStats> {
  const res = await fetch(`${apiBaseUrl()}/api/v1/quiz-attempts/stats`, {
    headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
    cache: 'no-store',
  });

  if (!res.ok) {
    const err = { message: `HTTP ${res.status}`, status: res.status };
    throw err;
  }

  const body = (await res.json()) as { data: QuizStats };
  return body.data;
}
