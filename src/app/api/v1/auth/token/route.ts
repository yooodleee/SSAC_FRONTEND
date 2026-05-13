import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { components } from '@/../api-contract/generated/api-types';

type AuthTokenResponse = components['schemas']['AuthTokenResponse'];

/**
 * POST /api/v1/auth/token
 *
 * OAuth 콜백이 발급한 일회용 authCode(30초 TTL)를 BE에 전달하여 JWT를 교환하는 BFF.
 * - 기존 회원: accessToken을 httpOnly 쿠키로 설정, BE Set-Cookie(refreshToken) 전달
 * - 신규 회원: tempToken / provider를 JSON으로 반환 (회원가입 플로우에 사용)
 */
export async function POST(request: NextRequest) {
  const backendUrl = process.env.API_BASE_URL;
  if (!backendUrl) {
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
  }

  let authCode: string | undefined;
  try {
    const body = (await request.json()) as { authCode?: string };
    authCode = body.authCode;
  } catch {
    return NextResponse.json({ errorCode: 'INVALID_REQUEST' }, { status: 400 });
  }

  if (!authCode) {
    return NextResponse.json({ errorCode: 'MISSING_AUTH_CODE' }, { status: 400 });
  }

  try {
    const beResponse = await fetch(`${backendUrl}/api/v1/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authCode }),
    });

    if (!beResponse.ok) {
      const errorData = (await beResponse.json().catch(() => ({}))) as { errorCode?: string };
      return NextResponse.json(
        { errorCode: errorData.errorCode ?? 'SERVER_ERROR' },
        { status: beResponse.status },
      );
    }

    const data = (await beResponse.json()) as AuthTokenResponse;

    const res = NextResponse.json({
      success: true,
      isNewUser: data.isNewUser ?? false,
      tempToken: data.tempToken,
      provider: data.provider,
    });

    if (!data.isNewUser && data.accessToken) {
      res.cookies.set('accessToken', data.accessToken, {
        httpOnly: true,
        path: '/',
        maxAge: 60 * 30, // 30분
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      });
      // 비회원 식별 쿠키 삭제 (Guest → 로그인 전환 완료)
      res.cookies.set('guestId', '', { path: '/', maxAge: 0 });
    }

    // BE의 Set-Cookie 헤더(refreshToken 등)를 클라이언트에 전달
    beResponse.headers.getSetCookie().forEach((cookie) => {
      res.headers.append('Set-Cookie', cookie);
    });

    return res;
  } catch {
    return NextResponse.json({ errorCode: 'SERVER_ERROR' }, { status: 500 });
  }
}
