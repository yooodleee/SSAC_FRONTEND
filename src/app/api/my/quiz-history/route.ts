import { NextRequest, NextResponse } from 'next/server';
import type { QuizHistoryPage } from '@/types';
import { ALL_QUIZ_HISTORY } from '@/data/quiz-history-mock';

export const dynamic = 'force-dynamic';

export function GET(request: NextRequest): NextResponse<QuizHistoryPage> {
  const { searchParams } = request.nextUrl;
  const page = Math.max(1, Number(searchParams.get('page') ?? '1'));
  const limit = Math.min(50, Math.max(1, Number(searchParams.get('limit') ?? '10')));

  const start = (page - 1) * limit;
  const items = ALL_QUIZ_HISTORY.slice(start, start + limit);

  return NextResponse.json({
    items,
    total: ALL_QUIZ_HISTORY.length,
    page,
    limit,
    hasMore: start + limit < ALL_QUIZ_HISTORY.length,
  });
}
