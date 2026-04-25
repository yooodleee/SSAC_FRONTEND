import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/** 인증 쿠키가 없을 때 로그인 페이지로 리다이렉트하는 보호 경로 목록 */
const PROTECTED_PREFIXES = ['/my'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + '/'),
  );

  if (!isProtected) return NextResponse.next();

  const authCookie = request.cookies.get('ssac_auth');
  if (!authCookie) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/my/:path*'],
};
