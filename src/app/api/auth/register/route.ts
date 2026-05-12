import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

interface RegisterResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    nickname: string;
    provider: string;
    segment: string;
  };
  merged: {
    quizCount: number;
  } | null;
}

/**
 * POST /api/auth/register
 * 닉네임·tempToken을 BE에 전달하고 accessToken을 httpOnly 쿠키로 저장하는 BFF.
 * refreshToken은 BE의 Set-Cookie를 그대로 클라이언트에 전달한다.
 */
export async function POST(request: NextRequest) {
  const backendUrl = process.env.API_BASE_URL;
  if (!backendUrl) {
    return NextResponse.json({ errorCode: 'SERVER_ERROR' }, { status: 500 });
  }

  try {
    const body = await request.json();

    const beResponse = await fetch(new URL('/api/auth/register', backendUrl).toString(), {
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

    const data = (await beResponse.json()) as RegisterResponse;

    const res = NextResponse.json({ success: true, user: data.user, merged: data.merged });

    // accessToken을 httpOnly 쿠키로 저장
    if (data.accessToken) {
      res.cookies.set('accessToken', data.accessToken, {
        httpOnly: true,
        path: '/',
        maxAge: 60 * 30, // 30분
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      });
    }

    // BE의 Set-Cookie 헤더(refreshToken 등)를 클라이언트에 전달
    beResponse.headers.getSetCookie().forEach((cookie) => {
      res.headers.append('Set-Cookie', cookie);
    });

    // 비회원 식별 쿠키 삭제
    res.cookies.set('guestId', '', { path: '/', maxAge: 0 });

    return res;
  } catch {
    return NextResponse.json({ errorCode: 'SERVER_ERROR' }, { status: 500 });
  }
}
