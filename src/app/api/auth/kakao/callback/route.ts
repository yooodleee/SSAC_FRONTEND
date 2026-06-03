import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * GET /api/auth/kakao/callback?token=...
 * BE가 URL 쿼리로 전달한 accessToken을 httpOnly 쿠키에 저장하는 BFF.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ errorCode: 'KAKAO_AUTH_FAILED' }, { status: 400 });
  }

  const res = NextResponse.json({ success: true });

  res.cookies.set('accessToken', token, {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 30, // 30분
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
  // 명시적 로그인 마커 — 세션 쿠키(maxAge 미지정)이므로 브라우저 종료 시 삭제됨
  res.cookies.set('loginSource', '1', {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  // 비회원 식별 쿠키 삭제 (Guest → 로그인 전환 완료)
  res.cookies.set('guestId', '', { path: '/', maxAge: 0 });

  return res;
}
