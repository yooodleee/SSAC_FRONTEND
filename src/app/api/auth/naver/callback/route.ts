import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

interface NaverCallbackResponse {
  success: boolean;
  data: {
    accessToken: string;
    tokenType: string;
    /** 비회원 퀴즈 기록 병합 완료 여부 (BE가 포함한 경우) */
    guestQuizMerged?: boolean;
  };
  message: string;
}

/**
 * GET /api/auth/naver/callback?code=...&state=...
 * 네이버 OAuth code/state를 BE에 전달하고 accessToken을 httpOnly 쿠키에 저장하는 BFF.
 * refreshToken은 BE가 Set-Cookie로 직접 설정하므로 헤더를 그대로 전달한다.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  if (!code || !state) {
    return NextResponse.json({ errorCode: 'NAVER_AUTH_FAILED' }, { status: 400 });
  }

  const backendUrl = process.env.API_BASE_URL;
  if (!backendUrl) {
    return NextResponse.json({ errorCode: 'SERVER_ERROR' }, { status: 500 });
  }

  try {
    const beUrl = new URL('/api/v1/auth/naver/callback', backendUrl);
    beUrl.searchParams.set('code', code);
    beUrl.searchParams.set('state', state);

    // guestId 쿠키 전달 (비회원 데이터 마이그레이션 용도, Swagger 명세 기준)
    const guestId = request.cookies.get('guestId')?.value;

    const beResponse = await fetch(beUrl.toString(), {
      headers: guestId ? { Cookie: `guestId=${guestId}` } : {},
    });

    if (!beResponse.ok) {
      const errorData = (await beResponse.json().catch(() => ({}))) as { errorCode?: string };
      return NextResponse.json(
        { errorCode: errorData.errorCode ?? 'SERVER_ERROR' },
        { status: beResponse.status },
      );
    }

    const body = (await beResponse.json()) as NaverCallbackResponse;
    const accessToken = body?.data?.accessToken;
    const guestQuizMerged = body?.data?.guestQuizMerged ?? false;

    const res = NextResponse.json({ success: true, guestQuizMerged });

    // LoginResponse 바디의 accessToken을 httpOnly 쿠키로 저장
    if (accessToken) {
      res.cookies.set('accessToken', accessToken, {
        httpOnly: true,
        path: '/',
        maxAge: 60 * 30, // 30분
        sameSite: 'lax',
      });
    }

    // 비회원 식별 쿠키 삭제 (Guest → 로그인 전환 완료)
    res.cookies.set('guestId', '', { path: '/', maxAge: 0 });

    // BE의 Set-Cookie 헤더(refreshToken 등)를 클라이언트에 전달
    beResponse.headers.getSetCookie().forEach((cookie) => {
      res.headers.append('Set-Cookie', cookie);
    });

    return res;
  } catch {
    return NextResponse.json({ errorCode: 'SERVER_ERROR' }, { status: 500 });
  }
}
