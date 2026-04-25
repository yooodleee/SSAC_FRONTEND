import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set('ssac_auth', 'mock-token', {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24, // 24시간
    sameSite: 'lax',
  });
  return response;
}
