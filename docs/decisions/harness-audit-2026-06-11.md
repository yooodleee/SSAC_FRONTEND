# 하네스 감사 — 2026-06-11

## 감사 기간

최근 7일 (2026-06-04 ~ 2026-06-11)

---

## STEP 1 — 반복 실수 패턴

| 패턴                              | 횟수 | 심각도 |
| --------------------------------- | ---- | ------ |
| `fix:` 커밋 (기능 복원/버그 수정) | 4회  | 중간   |
| `SSACFE-X` (미추적 이슈)          | 다수 | 낮음   |

**분석**

- `fix:` 커밋 4건 모두 개별 버그이며 동일 패턴 반복은 없음 → 하네스 강화 트리거 없음
- `SSACFE-X` 태그는 이슈 번호 미발급 상태로 작업한 커밋이 다수 존재 → 추적성 저하

---

## STEP 2 — docs/ 유효성 검사

### 아키텍처 디렉토리

| 경로              | 존재 여부 |
| ----------------- | --------- |
| `src/app/`        | ✅        |
| `src/features/`   | ✅        |
| `src/components/` | ✅        |
| `src/hooks/`      | ✅        |
| `src/services/`   | ✅        |
| `src/lib/`        | ✅        |
| `src/types/`      | ✅        |

→ `architecture.md`와 실제 디렉토리 구조 일치. **이상 없음.**

### 품질 등록부 (quality.md) 재평가

| TD     | 설명                 | quality.md 상태 | 실제 상태                            | 일치 |
| ------ | -------------------- | --------------- | ------------------------------------ | ---- |
| TD-001 | 테스트 없음          | 🔴 Red          | 테스트 디렉토리 없음                 | ✅   |
| TD-002 | ErrorBoundary 미완료 | 🟡 Yellow       | `error.tsx`, `global-error.tsx` 없음 | ✅   |
| TD-003 | API 재시도 없음      | 🟡 Yellow       | 변경 없음                            | ✅   |
| TD-004 | 보안 헤더 미설정     | 🔴 Red          | `next.config.ts` headers 없음        | ✅   |
| TD-005 | 접근성 검사 없음     | 🟡 Yellow       | 변경 없음                            | ✅   |

→ `quality.md` 내용이 현재 코드 상태와 **모두 일치**. 업데이트 불필요.

---

## STEP 3 — ESLint 규칙 효과 측정

`npm run lint` 실행 결과: **오류 0개, 경고 0개**

현재 적용 중인 규칙:

- `@typescript-eslint/no-explicit-any` — `any` 금지
- `@typescript-eslint/no-unused-vars` — 미사용 변수 금지
- `prefer-const` — const 강제
- `no-console` — warn/error만 허용
- `no-restricted-imports` (RULE 3) — `app/ → services/` 직접 import 금지
- `no-restricted-imports` (RULE 4) — `components/ → services|features` import 금지

→ 모든 규칙 정상 작동. **STEP 4 이동 불필요.**

---

## STEP 4 — 하네스 강화 결정

반복 패턴 없음 → 규칙 추가 없음.

단, 아래 **권고사항** 기록:

1. **SSACFE-X 커밋 다수** — 이슈 번호 없는 작업이 반복됨. AGENTS.md에 "작업 전 이슈 번호 발급" 규칙 추가 고려 (현재 1회성 기록).
2. **hooks/ — 레이어 규칙 ESLint 미적용** — `hooks/ → components|features` 방향 금지 규칙이 eslint.config.mjs에 없음. `architecture.md` 규칙표 기준 위반 가능성 존재.

---

## 현재 하네스 강도 평가

| 항목                       | 상태                                                                     |
| -------------------------- | ------------------------------------------------------------------------ | -------------------------- |
| 자동 차단 가능한 오류 유형 | 6개 (any, unused-vars, prefer-const, no-console, ARCH-001, ARCH-002/003) |
| 수동 확인이 필요한 영역    | hooks 레이어 위반, SSACFE-X 이슈 추적, TD-002/TD-004 미해결              |
| ESLint 커버리지 누락 영역  | `hooks/ → components                                                     | features` 방향 금지 미적용 |
| 테스트 안전망              | 없음 (TD-001 미해결)                                                     |

## 다음 감사까지 모니터링할 항목

- `SSACFE-X` 커밋 반복 여부 (이슈 추적 습관)
- TD-002 `error.tsx` / `global-error.tsx` 생성 여부
- TD-004 보안 헤더 설정 여부

## 다음 우선 강화 대상

1. `eslint.config.mjs`에 `hooks/` 레이어 위반 규칙 추가 (ARCH-004)
2. TD-002 ErrorBoundary 완료 (0.2 스프린트)
3. TD-004 보안 헤더 설정 (0.2 스프린트)
