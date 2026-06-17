import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';
import prettierConfig from 'eslint-config-prettier';
import jsxA11y from 'eslint-plugin-jsx-a11y';

// jsx-a11y recommended 규칙을 warn으로 적용 (TD-005)
// nextCoreWebVitals가 jsx-a11y 플러그인을 이미 포함 → 플러그인 재선언 없이 severity만 오버라이드
// 현재 코드베이스가 a11y 미준수 상태이므로 warn으로 시작 → 준수율 향상 후 error로 전환
// 전환 기준: 전체 파일에서 해당 규칙 위반 0건 달성 시
const jsxA11yWarnRules = Object.fromEntries(
  Object.entries(jsxA11y.flatConfigs.recommended.rules ?? {}).map(([rule, config]) => [
    rule,
    Array.isArray(config) ? ['warn', ...config.slice(1)] : 'warn',
  ]),
);

const eslintConfig = [
  // Next.js 16 native flat config (no FlatCompat needed)
  ...nextCoreWebVitals,
  ...nextTypescript,

  // Prettier: disable formatting rules that conflict with prettier
  prettierConfig,

  // ──────────────────────────────────────────────────────────
  // RULE 0: 접근성 (jsx-a11y) [TD-005]
  // nextCoreWebVitals에 플러그인이 이미 포함되어 있으므로 rules만 오버라이드
  // 현재: warn 모드 (기존 미준수 코드 허용, CI 차단 없음)
  // 목표: 전체 위반 0건 달성 후 error로 전환
  // 주요 규칙: alt-text, aria-props, interactive-supports-focus 등
  // ──────────────────────────────────────────────────────────
  {
    rules: jsxA11yWarnRules,
  },

  // ──────────────────────────────────────────────────────────
  // RULE 1: any 타입 금지
  // FIX: unknown + 타입 가드 사용. 예) const d: unknown = ...; if (typeof d === 'object') {}
  // ──────────────────────────────────────────────────────────
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'prefer-const': 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },

  // ──────────────────────────────────────────────────────────
  // RULE 2: scripts/ — Node.js 빌드 도구 규칙 완화
  // scripts/는 Next.js 앱이 아닌 Node.js 실행 파일이므로
  // require() 및 console 제한을 적용하지 않습니다.
  // ──────────────────────────────────────────────────────────
  {
    files: ['scripts/**/*.{ts,js,mts,cts}'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      'no-console': 'off',
    },
  },

  // ──────────────────────────────────────────────────────────
  // RULE 3: app/ → services/ 직접 import 금지 [ARCH-001]
  // FIX: features/<domain>/ 컴포넌트를 경유하세요. docs/architecture.md 참고
  // 예외: src/app/api/ Route Handler는 BFF 레이어이므로 services/ 직접 사용 허용.
  // ──────────────────────────────────────────────────────────
  {
    files: ['src/app/**/*.{ts,tsx}'],
    ignores: ['src/app/api/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/services', '@/services/*'],
              message:
                '[ARCH-001][FIX] app/ → services/ 직접 import 금지. ' +
                'features/<domain>/ 컴포넌트를 통해 데이터를 받으세요.',
            },
          ],
        },
      ],
    },
  },

  // ──────────────────────────────────────────────────────────
  // RULE 4: hooks/ → components|features import 금지 [ARCH-004]
  // FIX: 훅은 순수 로직만 담아야 합니다. UI가 필요하면 컴포넌트로 분리하세요.
  //      특정 도메인 전용 훅은 features/<domain>/ 폴더 내부로 이동하세요.
  // ──────────────────────────────────────────────────────────
  {
    files: ['src/hooks/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/components', '@/components/*'],
              message:
                '[ARCH-004][FIX] hooks/ → components/ 금지. ' +
                '훅은 UI에 의존하지 않아야 합니다. UI 로직은 컴포넌트로 분리하세요.',
            },
            {
              group: ['@/features', '@/features/*'],
              message:
                '[ARCH-004][FIX] hooks/ → features/ 금지. ' +
                '특정 도메인에 종속된 훅은 features/<domain>/ 폴더 내부로 이동하세요.',
            },
          ],
        },
      ],
    },
  },

  // ──────────────────────────────────────────────────────────
  // RULE 5: components/ → services|features import 금지 [ARCH-002, ARCH-003]
  // FIX: 데이터를 Props로 받도록 컴포넌트를 재설계하세요.
  // ──────────────────────────────────────────────────────────
  {
    files: ['src/components/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/services', '@/services/*'],
              message: '[ARCH-002][FIX] components/ → services/ 금지. Props로 데이터를 받으세요.',
            },
            {
              group: ['@/features', '@/features/*'],
              message:
                '[ARCH-003][FIX] components/ → features/ 금지. 공통 컴포넌트는 도메인에 의존하지 않아야 합니다.',
            },
          ],
        },
      ],
    },
  },
];

export default eslintConfig;
