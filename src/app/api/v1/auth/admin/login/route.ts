import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * POST /api/v1/auth/admin/login
 * 관리자 코드로 로그인. accessToken을 HttpOnly 쿠키로 설정한다.
 */
export async function POST(request: NextRequest) {
  const backendUrl = process.env.API_BASE_URL;
  if (!backendUrl) return NextResponse.json({ errorCode: 'SERVER_ERROR' }, { status: 500 });

  try {
    const body = await request.json();

    const beResponse = await fetch(new URL('/api/v1/auth/admin/login', backendUrl).toString(), {
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
        { errorCode: errorData.code ?? 'ADMIN-001', message: errorData.message },
        { status: beResponse.status },
      );
    }

    const data = (await beResponse.json()) as {
      accessToken?: string;
      tokenType?: string;
      accessTokenExpiresIn?: number;
      user?: { id?: number; nickname?: string; role?: string };
    };

    const res = NextResponse.json({ success: true, user: data.user });

    if (data.accessToken) {
      res.cookies.set('accessToken', data.accessToken, {
        httpOnly: true,
        path: '/',
        maxAge: data.accessTokenExpiresIn ?? 60 * 30,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      });
    }

    beResponse.headers.getSetCookie().forEach((cookie) => {
      res.headers.append('Set-Cookie', cookie);
    });

    return res;
  } catch {
    return NextResponse.json({ errorCode: 'SERVER_ERROR' }, { status: 500 });
  }
}
