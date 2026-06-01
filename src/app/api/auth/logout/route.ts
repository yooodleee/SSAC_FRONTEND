import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * POST /api/auth/logout
 *
 * BE에 로그아웃 요청을 전달하고, accessToken/refreshToken 쿠키를 삭제한다.
 *
 * ⚠️ refreshToken 쿠키는 Path=/api/v1/auth 로 발급되므로,
 *    삭제 Set-Cookie에도 동일 Path를 지정해야 브라우저가 삭제한다.
 *    response.cookies.delete()는 Path를 자동으로 맞추지 않으므로
 *    new NextResponse(body, { headers }) 패턴으로 직접 주입한다.
 */
export async function POST(request: NextRequest) {
  const backendUrl = process.env.API_BASE_URL;
  const cookieHeader = request.headers.get('cookie') ?? '';
  const isProduction = process.env.NODE_ENV === 'production';
  const secure = isProduction ? '; Secure' : '';

  // BE 로그아웃 호출 (refreshToken 무효화) — 실패해도 FE 쿠키는 삭제 진행
  if (backendUrl) {
    await fetch(`${backendUrl}/api/v1/auth/logout`, {
      method: 'POST',
      headers: { Cookie: cookieHeader },
    }).catch(() => {});
  }

  const responseHeaders = new Headers({ 'Content-Type': 'application/json' });

  // accessToken 삭제 (Path=/)
  responseHeaders.append(
    'Set-Cookie',
    `accessToken=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax${secure}`,
  );

  // refreshToken 삭제 — BE 발급 Path와 동일하게 /api/v1/auth 지정
  responseHeaders.append(
    'Set-Cookie',
    `refreshToken=; Path=/api/v1/auth; HttpOnly; Max-Age=0; SameSite=Lax${secure}`,
  );

  return new NextResponse(JSON.stringify({ success: true }), {
    status: 200,
    headers: responseHeaders,
  });
}
