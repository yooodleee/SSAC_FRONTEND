import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * POST /api/v1/auth/register/email
 * 이메일+비밀번호 직접 회원가입 BFF.
 * 1) BE register → accessToken이 응답에 있으면 쿠키 설정
 * 2) accessToken이 없으면 BE login 으로 자동 로그인 후 쿠키 설정
 */
export async function POST(request: NextRequest) {
  const backendUrl = process.env.API_BASE_URL;
  if (!backendUrl) return NextResponse.json({ errorCode: 'SERVER_ERROR' }, { status: 500 });

  try {
    const body = (await request.json()) as Record<string, unknown>;

    // ── 1. 회원가입 요청 ──────────────────────────────────────────
    const beResponse = await fetch(new URL('/api/v1/auth/register/email', backendUrl).toString(), {
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
        { errorCode: errorData.code ?? 'SERVER_ERROR', message: errorData.message },
        { status: beResponse.status },
      );
    }

    const data = (await beResponse.json()) as {
      success?: boolean;
      data?: { accessToken?: string };
    };

    let accessToken = data.data?.accessToken ?? null;
    let extraSetCookies = beResponse.headers.getSetCookie();

    // ── 2. 응답에 accessToken이 없으면 로그인으로 자동 취득 ────────
    if (!accessToken) {
      const loginResponse = await fetch(
        new URL('/api/v1/auth/login/email', backendUrl).toString(),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: body.email, password: body.password }),
        },
      ).catch(() => null);

      if (loginResponse?.ok) {
        const loginData = (await loginResponse.json().catch(() => ({}))) as {
          data?: { accessToken?: string };
        };
        accessToken = loginData.data?.accessToken ?? null;
        extraSetCookies = [...extraSetCookies, ...loginResponse.headers.getSetCookie()];
      }
    }

    // ── 3. 쿠키 설정 후 응답 반환 ────────────────────────────────
    const res = NextResponse.json({ success: true });

    if (accessToken) {
      res.cookies.set('accessToken', accessToken, {
        httpOnly: true,
        path: '/',
        maxAge: 60 * 30,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      });
    }

    extraSetCookies.forEach((cookie) => {
      res.headers.append('Set-Cookie', cookie);
    });

    res.cookies.set('guestId', '', { path: '/', maxAge: 0 });
    return res;
  } catch {
    return NextResponse.json({ errorCode: 'SERVER_ERROR' }, { status: 500 });
  }
}
