import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';
import prettierConfig from 'eslint-config-prettier';

const eslintConfig = [
  // Next.js 16 native flat config (no FlatCompat needed)
  ...nextCoreWebVitals,
  ...nextTypescript,

  // Prettier: disable formatting rules that conflict with prettier
  prettierConfig,

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
