import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript', 'prettier'),

  // ──────────────────────────────────────────────────────────
  // RULE 1: any 타입 금지
  // WHY: TypeScript strict 모드의 핵심. any 사용 시 타입 안전망 붕괴.
  // FIX: unknown 사용 후 타입 가드로 좁히거나, 정확한 타입/인터페이스 정의.
  //      예) const data: unknown = ...; if (typeof data === 'object') { ... }
  // ──────────────────────────────────────────────────────────
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },

  // ──────────────────────────────────────────────────────────
  // RULE 2: 사용하지 않는 변수 금지
  // WHY: 미사용 변수는 코드 노이즈이며 에이전트가 자주 생성함.
  // FIX: 사용하지 않는 변수는 제거하거나, 의도적 무시는 _접두사 사용.
  //      예) function handler(_event: Event) { ... }
  // ──────────────────────────────────────────────────────────
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'prefer-const': 'error',
    },
  },

  // ──────────────────────────────────────────────────────────
  // RULE 3: console.log 금지 (warn/error만 허용)
  // WHY: 디버깅용 console.log가 프로덕션에 유출되는 것을 방지.
  // FIX: console.log 제거. 영구적 로깅이 필요하면 console.warn/error 사용.
  // ──────────────────────────────────────────────────────────
  {
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },

  // ──────────────────────────────────────────────────────────
  // RULE 4: 레이어 의존성 위반 — app에서 services 직접 import 금지
  // WHY: app/ → services/ 직접 의존은 아키텍처 레이어를 파괴함.
  //      UI 조립 레이어(app)가 API 로직을 직접 알아서는 안 됨.
  // FIX: app/에서 데이터가 필요하면 features/<domain>/ 컴포넌트를 사용하고,
  //      해당 컴포넌트 내부에서 서비스를 호출하게 하세요.
  //      또는 Next.js Server Component에서 직접 fetch 필요 시 별도 ADR 작성.
  // ──────────────────────────────────────────────────────────
  {
    files: ['src/app/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/services', '@/services/*'],
              message:
                '[레이어 위반] app/에서 services/를 직접 import할 수 없습니다. ' +
                'features/<domain>/ 컴포넌트를 경유하거나, docs/architecture.md를 참고하세요.',
            },
          ],
        },
      ],
    },
  },

  // ──────────────────────────────────────────────────────────
  // RULE 5: 레이어 의존성 위반 — components에서 services/features import 금지
  // WHY: 공통 UI 컴포넌트(components/)는 도메인 로직을 몰라야 재사용 가능.
  //      services나 features를 알면 범용성이 사라짐.
  // FIX: 컴포넌트가 데이터를 직접 가져오지 않도록 Props로 받으세요.
  //      데이터 페칭 책임은 features/ 또는 app/에 있습니다.
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
              message:
                '[레이어 위반] components/에서 services/를 import할 수 없습니다. ' +
                'Props로 데이터를 받거나, docs/architecture.md의 레이어 규칙을 참고하세요.',
            },
            {
              group: ['@/features', '@/features/*'],
              message:
                '[레이어 위반] components/에서 features/를 import할 수 없습니다. ' +
                '공통 컴포넌트는 도메인에 의존하지 않아야 합니다.',
            },
          ],
        },
      ],
    },
  },
];

export default eslintConfig;
