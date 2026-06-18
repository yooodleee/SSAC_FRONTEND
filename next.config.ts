import type { NextConfig } from 'next';

// Content-Security-Policy
// - script-src 'unsafe-inline': Next.js App Router 인라인 스크립트 필요
// - style-src 'unsafe-inline': Tailwind CSS 인라인 스타일 필요
// - img-src res.cloudinary.com: BE가 Cloudinary로 재업로드한 콘텐츠 이미지 CDN
// - connect-src NEXT_PUBLIC_BACKEND_URL: 브라우저에서 BE를 직접 호출하는 서비스(signup 등) 허용
// 강화 방향: nonce 기반 CSP(Middleware)로 전환 시 'unsafe-inline' 제거 가능 (별도 ADR 필요)
const beOrigin = (() => {
  try {
    const url = process.env.NEXT_PUBLIC_BACKEND_URL;
    return url ? new URL(url).origin : '';
  } catch {
    return '';
  }
})();

const ContentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://res.cloudinary.com",
  "font-src 'self' data:",
  `connect-src 'self'${beOrigin ? ` ${beOrigin}` : ''}`,
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
].join('; ');

const securityHeaders = [
  // 클릭재킹 방지 (frame-ancestors 'none'과 이중 방어)
  { key: 'X-Frame-Options', value: 'DENY' },
  // MIME 스니핑 방지
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Referrer 정보 최소화
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // 불필요한 브라우저 기능 차단
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
  // XSS 필터 (레거시 브라우저 대응)
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  // CSP
  { key: 'Content-Security-Policy', value: ContentSecurityPolicy },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },

  images: {
    remotePatterns: [
      // Cloudinary — 모든 콘텐츠 이미지 및 썸네일 CDN
      // BE(NotionImageMigrator)가 Notion S3 URL을 Cloudinary로 재업로드 후 영구 URL을 DB에 저장
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
};

export default nextConfig;
