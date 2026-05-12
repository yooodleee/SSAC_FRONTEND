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
  return response;
}
