import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * POST /api/v1/auth/login/email
 * 이메일+비밀번호 로그인 BFF.
 * BE에서 accessToken을 응답 body로, refreshToken을 HttpOnly Cookie로 전달한다.
 */
export async function POST(request: NextRequest) {
  const backendUrl = process.env.API_BASE_URL;
  if (!backendUrl) return NextResponse.json({ errorCode: 'SERVER_ERROR' }, { status: 500 });

  try {
    const body = await request.json();

    const beResponse = await fetch(new URL('/api/v1/auth/login/email', backendUrl).toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!beResponse.ok) {
      const errorData = (await beResponse.json().catch(() => ({}))) as {
        message?: string;
        code?: string;
      };
      return NextResponse.json(
        { errorCode: errorData.code ?? 'AUTH-011', message: errorData.message },
        { status: beResponse.status },
      );
    }

    const data = (await beResponse.json()) as {
      success?: boolean;
      data?: { accessToken?: string };
    };

    const res = NextResponse.json({ success: true });

    if (data.data?.accessToken) {
      res.cookies.set('accessToken', data.data.accessToken, {
        httpOnly: true,
        path: '/',
        maxAge: 60 * 30,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      });
      // 명시적 로그인 마커 — 세션 쿠키(maxAge 미지정)이므로 브라우저 종료 시 삭제됨
      // 자동 세션 복원(reissue)과 구분하여 온보딩 흐름에서 올바른 isLoggedIn을 계산하는 데 사용
      res.cookies.set('loginSource', '1', {
        httpOnly: true,
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      });
    }

    beResponse.headers.getSetCookie().forEach((cookie) => {
      res.headers.append('Set-Cookie', cookie);
    });

    res.cookies.set('guestId', '', { path: '/', maxAge: 0 });
    return res;
  } catch {
    return NextResponse.json({ errorCode: 'SERVER_ERROR' }, { status: 500 });
  }
}
