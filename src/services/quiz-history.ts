import type { QuizHistoryPage } from '@/types';
import { ALL_QUIZ_HISTORY } from '@/data/quiz-history-mock';

export const FALLBACK_QUIZ_HISTORY: QuizHistoryPage = {
  items: ALL_QUIZ_HISTORY.slice(0, 10),
  total: ALL_QUIZ_HISTORY.length,
  page: 1,
  limit: 10,
  hasMore: ALL_QUIZ_HISTORY.length > 10,
};

export async function fetchQuizHistory(page: number, limit = 10): Promise<QuizHistoryPage> {
  const cookieString = typeof document !== 'undefined' ? document.cookie : '';
  const hasAuth = cookieString.includes('access_token');

  if (!hasAuth) {
    const start = (page - 1) * limit;
    return {
      items: ALL_QUIZ_HISTORY.slice(start, start + limit),
      total: ALL_QUIZ_HISTORY.length,
      page,
      limit,
      hasMore: start + limit < ALL_QUIZ_HISTORY.length,
    };
  }

  const res = await fetch(`/api/my/quiz-history?page=${page}&limit=${limit}`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('퀴즈 기록을 불러오지 못했습니다.');
  return res.json() as Promise<QuizHistoryPage>;
}
