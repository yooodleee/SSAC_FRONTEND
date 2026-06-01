import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * POST /api/v1/auth/reissue
 *
 * BFF가 refreshToken 쿠키를 BE에 전달해 새 토큰을 발급받는다.
 * BE는 새 accessToken/refreshToken을 응답 body(data 필드)에 포함한다.
 * BFF가 cookies().set()으로 직접 쿠키를 설정한다 (Set-Cookie 포워딩 방식 미사용).
 *
 * refreshToken 속성:
 *   Path=/api/v1/auth, HttpOnly, Secure, SameSite=None, 14일 (BE JwtProperties 동일)
 */
export async function POST() {
  const backendUrl = process.env.API_BASE_URL;
  if (!backendUrl) {
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
  }

  // refreshToken 쿠키만 BE에 전달 (accessToken은 BFF 전용)
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refreshToken')?.value;

  const beResponse = await fetch(`${backendUrl}/api/v1/auth/reissue`, {
    method: 'POST',
    headers: { Cookie: `refreshToken=${refreshToken ?? ''}` },
  });

  const json = (await beResponse.json()) as { data?: Record<string, unknown> };

  if (!beResponse.ok) {
    return NextResponse.json(json, { status: beResponse.status });
  }

  const userData = json.data ?? {};
  const newAccessToken = (userData as { accessToken?: string }).accessToken;
  const newRefreshToken = (userData as { refreshToken?: string }).refreshToken;

  // accessToken이 없으면 재발급 실패로 처리
  if (!newAccessToken) {
    return NextResponse.json({ error: 'Session expired' }, { status: 401 });
  }

  const isProduction = process.env.NODE_ENV === 'production';

  // accessToken: 30분, Path=/ (서버 컴포넌트 인증 확인용)
  cookieStore.set('accessToken', newAccessToken, {
    path: '/',
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 60 * 30,
  });

  // refreshToken: 14일, BE JwtProperties와 동일한 속성으로 설정
  if (newRefreshToken) {
    cookieStore.set('refreshToken', newRefreshToken, {
      path: '/api/v1/auth',
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 60 * 60 * 24 * 14,
    });
  }

  // 기존 FE 파싱 호환성 유지: userData (unwrapped ReissueResponse) 반환
  return NextResponse.json(userData);
}
