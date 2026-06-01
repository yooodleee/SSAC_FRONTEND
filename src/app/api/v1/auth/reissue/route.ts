import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * POST /api/v1/auth/reissue
 *
 * refreshToken 쿠키(path: /api/v1/auth)를 BE에 전달해 새 토큰을 발급받는 BFF 엔드포인트.
 * 이 경로(/api/v1/auth/*)가 refreshToken 쿠키 path와 일치하므로 브라우저가 자동으로 쿠키를 포함한다.
 *
 * ⚠️ Set-Cookie 포워딩 주의
 * NextResponse 생성 후 res.headers.append('Set-Cookie', ...)는 Next.js에서 신뢰할 수 없음.
 * 모든 Set-Cookie 헤더를 응답 생성 시 한 번에 주입하기 위해 new NextResponse(body, { headers }) 패턴 사용.
 */
export async function POST(request: NextRequest) {
  const backendUrl = process.env.API_BASE_URL;
  if (!backendUrl) {
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
  }

  // 브라우저의 Cookie 헤더를 BE에 전달 (refreshToken 쿠키 포함)
  const cookieHeader = request.headers.get('cookie') ?? '';

  const beResponse = await fetch(`${backendUrl}/api/v1/auth/reissue`, {
    method: 'POST',
    headers: { Cookie: cookieHeader },
  });

  if (!beResponse.ok) {
    return NextResponse.json({ error: 'Session expired' }, { status: 401 });
  }

  // BE 응답 body에서 사용자 컨텍스트를 추출해 클라이언트에 전달
  const beBody = (await beResponse.json()) as { data?: Record<string, unknown> };
  const userData = beBody.data ?? {};

  // accessToken이 없으면 재발급 실패로 처리 (200이지만 토큰 없음 케이스 방어)
  const accessToken = (userData as { accessToken?: string }).accessToken;
  if (!accessToken) {
    return NextResponse.json({ error: 'Session expired' }, { status: 401 });
  }

  // 응답 헤더를 생성 시점에 한 번에 주입 (헤더 변이 방식 미사용)
  const isProduction = process.env.NODE_ENV === 'production';
  const responseHeaders = new Headers({ 'Content-Type': 'application/json' });

  // accessToken: BFF가 응답 body에서 추출해 httpOnly 쿠키로 설정 (30분)
  responseHeaders.append(
    'Set-Cookie',
    `accessToken=${accessToken}; Path=/; HttpOnly; Max-Age=1800; SameSite=Lax${isProduction ? '; Secure' : ''}`,
  );

  // BE의 Set-Cookie(refreshToken rotation)를 브라우저로 그대로 전달
  beResponse.headers.getSetCookie().forEach((cookie) => {
    responseHeaders.append('Set-Cookie', cookie);
  });

  return new NextResponse(JSON.stringify(userData), {
    status: 200,
    headers: responseHeaders,
  });
}
