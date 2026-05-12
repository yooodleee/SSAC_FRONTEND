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
 *
 * ⚠️ Cookie 전달 정책:
 * BE는 /api/v1/auth/naver/login 호출 시 생성한 세션(JSESSIONID 등)으로 OAuth state를 검증한다.
 * BFF 서버→서버 호출에 브라우저 Cookie를 그대로 전달하지 않으면
 * state 검증이 실패해 NAVER_AUTH_FAILED가 발생한다 (시크릿 모드에서 특히 재현됨).
 * 따라서 브라우저 요청의 Cookie 헤더 전체를 BE에 포워딩한다.
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

    // 브라우저 Cookie 헤더 전체를 BE에 포워딩
    // - JSESSIONID: BE의 OAuth state 검증에 필수 (없으면 state mismatch → 인증 실패)
    // - guestId: 비회원 데이터 마이그레이션
    // - localhost 환경에서 Chrome은 포트 무관하게 쿠키를 공유하므로
    //   backendUrl:PORT 에서 설정한 JSESSIONID가 BFF 요청에도 포함된다.
    const incomingCookieHeader = request.headers.get('cookie') ?? '';

    // BE는 302 리다이렉트로 응답하므로 자동 추적을 막고 Location 헤더를 직접 파싱한다.
    const beResponse = await fetch(beUrl.toString(), {
      headers: incomingCookieHeader ? { Cookie: incomingCookieHeader } : {},
      redirect: 'manual',
    });

    // 302 리다이렉트: Location 헤더에서 isNewUser / tempToken 추출
    if (beResponse.status === 302) {
      const location = beResponse.headers.get('location') ?? '';
      const redirectParams = new URL(location, 'http://localhost').searchParams;
      const isNewUser = redirectParams.get('isNewUser') === 'true';
      const tempToken = redirectParams.get('tempToken') ?? undefined;
      const provider = redirectParams.get('provider') ?? undefined;

      const res = NextResponse.json({
        success: true,
        guestQuizMerged: false,
        isNewUser,
        tempToken,
        provider,
      });
      res.cookies.set('guestId', '', { path: '/', maxAge: 0 });
      return res;
    }

    if (!beResponse.ok) {
      const errorData = (await beResponse.json().catch(() => ({}))) as { errorCode?: string };
      return NextResponse.json(
        { errorCode: errorData.errorCode ?? 'SERVER_ERROR' },
        { status: beResponse.status },
      );
    }

    // 비-리다이렉트 JSON 응답 처리 (기존 사용자 등 fallback)
    const body = (await beResponse.json()) as NaverCallbackResponse;
    const accessToken = body?.data?.accessToken;
    const guestQuizMerged = body?.data?.guestQuizMerged ?? false;

    const res = NextResponse.json({ success: true, guestQuizMerged, isNewUser: false });

    // LoginResponse 바디의 accessToken을 httpOnly 쿠키로 저장
    if (accessToken) {
      res.cookies.set('accessToken', accessToken, {
        httpOnly: true,
        path: '/',
        maxAge: 60 * 30, // 30분
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
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
