# ML-003: jest.config.js ESLint 차단 (CommonJS require → ESM import)

| 항목      | 내용                          |
| --------- | ----------------------------- |
| 날짜      | 2026-06-11                    |
| 발견자    | pre-commit hook (lint-staged) |
| 에이전트  | Claude Code                   |
| 반복 횟수 | 1회                           |

## 문제 설명

`jest.config.js`를 CommonJS `require()` 방식으로 작성했고 커밋이 차단되었습니다.

```
✖ eslint --fix:
C:\...\jest.config.js
  2:18  error  A `require()` style import is forbidden
               @typescript-eslint/no-require-imports
```

`npm ci` → `jest.config.js` 작성 → 스테이징 → pre-commit 실패 → `jest.config.mjs` 재작성 순서로 진행되어 불필요한 왕복이 발생했습니다.

## 근본 원인

**루트 레벨 설정 파일도 lint-staged 범위(`*.{ts,tsx,js,mjs,cjs}`)에 포함된다는 점을 인지하지 못했습니다.**

- `src/` 외부 파일에도 `@typescript-eslint/no-require-imports` 규칙이 전역으로 적용됨
- Next.js 공식 문서 예시가 CJS 방식이었으나, 이 프로젝트는 ESLint에서 `require()` 를 전역 금지
- `eslint.config.mjs`의 scripts/ 예외(RULE 2)가 루트 설정 파일을 포함하지 않음

## 하네스에 추가된 해결책

- [x] `AGENTS.md` 루트 레벨 설정 파일 ESM 방식 명시 (ML-003 참조)

## 검증 방법

새 설정 파일(jest.config, playwright.config, next.config 등) 작성 시 `.mjs` 확장자 또는 ESM `import`/`export default`를 사용하면 ESLint 오류 없이 커밋됩니다.
