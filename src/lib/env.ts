/**
 * Centralised, type-safe access to environment variables.
 *
 * ⚠️ NEXT_PUBLIC_* 변수는 Next.js 정적 치환 규칙상 리터럴 접근만 동작한다.
 *    process.env[dynamicKey] 형태는 브라우저에서 undefined를 반환하므로 사용 금지.
 *    서버 전용 변수(비공개)는 이 파일에 노출하지 않고 Route Handler에서 직접 접근한다.
 */
export const env = {
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? 'SSAC Frontend',
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? '',
  backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL ?? '',
} as const;

// 서버 사이드 런타임 시 필수 PUBLIC 변수 검증
// ⚠️ 빌드 타임(정적 생성)에는 실행되지 않도록 NEXT_PHASE 로 분기
if (typeof window === 'undefined' && process.env.NEXT_PHASE !== 'phase-production-build') {
  if (!env.apiBaseUrl)
    throw new Error('Missing required environment variable: NEXT_PUBLIC_API_BASE_URL');
  if (!env.backendUrl)
    throw new Error('Missing required environment variable: NEXT_PUBLIC_BACKEND_URL');
}
