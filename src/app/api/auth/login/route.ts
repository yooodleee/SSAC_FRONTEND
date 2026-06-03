import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set('accessToken', 'mock-token', {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 30, // 30분
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
  // 명시적 로그인 마커 — 세션 쿠키(maxAge 미지정)이므로 브라우저 종료 시 삭제됨
  response.cookies.set('loginSource', '1', {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
  return response;
}
