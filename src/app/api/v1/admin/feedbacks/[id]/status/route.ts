import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * PATCH /api/v1/admin/feedbacks/{feedbackId}/status
 * 피드백 상태 변경 (PENDING | IN_PROGRESS | DONE)
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const backendUrl = process.env.API_BASE_URL;

  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value ?? null;

  const { id } = await params;

  if (!backendUrl) {
    return new Response(null, { status: 204 });
  }

  try {
    const body = await request.json();

    const beResponse = await fetch(
      new URL(`/api/v1/admin/feedbacks/${id}/status`, backendUrl).toString(),
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      },
    );

    if (!beResponse.ok) {
      const errorData = (await beResponse.json().catch(() => ({}))) as {
        code?: string;
        message?: string;
      };
      return NextResponse.json(
        { errorCode: errorData.code ?? 'ADMIN-002' },
        { status: beResponse.status },
      );
    }

    return new Response(null, { status: 204 });
  } catch {
    return NextResponse.json({ errorCode: 'SERVER_ERROR' }, { status: 500 });
  }
}
