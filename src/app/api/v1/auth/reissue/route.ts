import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * POST /api/v1/auth/reissue
 *
 * refreshToken 쿠키(path: /api/v1/auth)를 BE에 전달해 새 토큰을 발급받는 BFF 엔드포인트.
 * 이 경로(/api/v1/auth/*)가 refreshToken 쿠키 path와 일치하므로 브라우저가 자동으로 쿠키를 포함한다.
 * BE가 새 accessToken/refreshToken을 Set-Cookie로 응답하므로 해당 헤더를 클라이언트에 그대로 전달한다.
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

  const res = NextResponse.json(userData);

  // accessToken을 httpOnly 쿠키로 설정 (서버 컴포넌트의 인증 확인에 사용됨)
  const accessToken = (userData as { accessToken?: string }).accessToken;
  if (accessToken) {
    res.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 30, // 30분
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
  }

  // BE의 Set-Cookie 헤더(refreshToken rotation)를 클라이언트에 전달
  const setCookies = beResponse.headers.getSetCookie();
  setCookies.forEach((cookie) => {
    res.headers.append('Set-Cookie', cookie);
  });

  return res;
}
