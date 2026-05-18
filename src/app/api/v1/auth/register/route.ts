import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const backendUrl = process.env.API_BASE_URL;
  if (!backendUrl) return NextResponse.json({ errorCode: 'SERVER_ERROR' }, { status: 500 });

  try {
    const body = await request.json();
    const beResponse = await fetch(new URL('/api/v1/auth/register', backendUrl).toString(), {
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

    const res = NextResponse.json({ success: true });

    if (data.data?.accessToken) {
      res.cookies.set('accessToken', data.data.accessToken, {
        httpOnly: true,
        path: '/',
        maxAge: 60 * 30,
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
