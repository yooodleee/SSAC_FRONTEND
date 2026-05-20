import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';

/**
 * POST /api/v1/feedback — 개발팀 피드백 전송
 *
 * 비로그인 사용자는 userId를 null로 보낸다 (BE 스펙).
 * API_BASE_URL이 없는 로컬 개발 환경에서는 204를 반환한다.
 */
export async function POST(request: NextRequest): Promise<Response> {
  let body: { message?: string; pageUrl?: string };
  try {
    body = (await request.json()) as { message?: string; pageUrl?: string };
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const message = body.message?.trim();
  if (!message) {
    return Response.json({ error: 'Message is required' }, { status: 400 });
  }

  // 로그인 상태에서 userId 추출 (선택)
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value ?? null;

  let userId: string | null = null;
  if (token) {
    try {
      const payloadB64 = token.split('.')[1];
      if (payloadB64) {
        const payload = JSON.parse(
          Buffer.from(payloadB64, 'base64url').toString('utf-8'),
        ) as Record<string, unknown>;
        const sub = payload.sub ?? payload.userId ?? payload.id;
        userId = typeof sub === 'string' || typeof sub === 'number' ? String(sub) : null;
      }
    } catch {
      // userId 추출 실패 시 null 유지
    }
  }

  const apiBaseUrl = process.env.API_BASE_URL;
  if (!apiBaseUrl) {
    // 로컬 개발 환경: 전송 성공으로 처리
    return new Response(null, { status: 204 });
  }

  const upstream = await fetch(`${apiBaseUrl}/api/v1/feedback`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      message,
      userId,
      pageUrl: body.pageUrl ?? null,
    }),
  });

  const data = (await upstream.json().catch(() => ({}))) as unknown;
  return Response.json(data, { status: upstream.status });
}
