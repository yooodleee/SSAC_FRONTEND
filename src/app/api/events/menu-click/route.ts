import { after } from 'next/server';
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';

interface MenuClickPayload {
  eventType: 'MENU_CLICK';
  menuId: string;
  menuName: string;
  clickedAt: string;
  pageContext: string;
}

/** JWT payload의 sub(userId) 추출 — 디코딩만 수행, 검증 없음 */
function extractUserIdFromToken(token: string): string | null {
  try {
    const payloadB64 = token.split('.')[1];
    if (!payloadB64) return null;
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf-8')) as Record<
      string,
      unknown
    >;
    const sub = payload.sub ?? payload.userId ?? payload.id;
    return typeof sub === 'string' || typeof sub === 'number' ? String(sub) : null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest): Promise<Response> {
  let body: Partial<MenuClickPayload>;
  try {
    body = (await request.json()) as Partial<MenuClickPayload>;
  } catch {
    return new Response(null, { status: 400 });
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value ?? null;
  const guestId = cookieStore.get('guestId')?.value ?? null;

  const userId = accessToken ? extractUserIdFromToken(accessToken) : null;

  const fullPayload = {
    eventType: 'MENU_CLICK',
    menuId: body.menuId ?? '',
    menuName: body.menuName ?? '',
    userId,
    guestId: userId ? null : guestId,
    clickedAt: body.clickedAt ?? new Date().toISOString(),
    pageContext: body.pageContext ?? '',
  };

  const apiBaseUrl = process.env.API_BASE_URL;
  if (apiBaseUrl) {
    // after(): 응답 반환 후에도 fetch가 완료될 때까지 런타임을 유지
    // fire-and-forget 단독 사용 시 서버리스 환경에서 함수가 조기 종료되어
    // BE에 불완전한 JSON이 전달될 수 있는 문제를 방지
    after(
      fetch(`${apiBaseUrl}/api/events/menu-click`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullPayload),
      }).catch(() => {
        // silent fail: 이벤트 전송 실패가 서비스에 영향을 주지 않음
      }),
    );
  }

  // 클라이언트에는 즉시 204 반환 (백엔드 응답을 기다리지 않음)
  return new Response(null, { status: 204 });
}
