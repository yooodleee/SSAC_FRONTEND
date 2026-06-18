# 반복 실수 방지 규칙 (Mistake-Log 기반)

> 아래 규칙은 실제 반복된 실수에서 도출된 하네스입니다. 위반 시 same mistake 재발 위험.
> 메인 환경 진입점: [AGENTS.md](../../AGENTS.md)

---

## [ML-001] 인증 구현 전 필수 확인 → `docs/decisions/mistake-log-001.md`

인증·토큰 관련 코드(SessionRestoreProvider, BFF Set-Cookie, token refresh 등)를 구현하기 전에
반드시 아래를 BE 팀과 합의한다:

```
□ Set-Cookie 방식 — 직접 포워딩 vs cookieStore.set() 중 어느 방식인가
□ 동시 재발급 처리 — 뮤텍스(mutex) 구현이 FE 책임인가 BE 책임인가
□ 리다이렉트 파라미터 — redirectTo 쿼리 파라미터 명세 확인
□ 토큰 삭제 Path — refreshToken 삭제 API 경로가 확정되었는가
```

합의 없이 인증 플로우 구현을 시작하는 것은 금지한다.

---

## [ML-002] 외부 API 응답 구조 사전 검증 → `docs/decisions/mistake-log-002.md`

BE가 제3자 API(Notion, 외부 서비스 등)를 가공해 응답하는 경우,
**실제 응답 샘플을 먼저 수집하고 타입을 명세화한 뒤** 렌더러/훅 구현을 시작한다.

```
□ 실제 BE 응답 JSON 샘플 수집 (curl 또는 Network 탭)
□ enum 명칭 확인 — BE 언어(Java SDK 등)의 실제 직렬화 결과값 확인
□ 중첩 구조 확인 — has_children, 재귀 여부 등 depth 명세 확인
□ api-contract/generated/api-types.ts 또는 별도 샘플 파일로 명세화 완료
```

응답 구조 미확인 상태에서 렌더러 구현을 시작하는 것은 금지한다.

---

## [ML-003] 루트 레벨 설정 파일은 ESM 방식 → `docs/decisions/mistake-log-003.md`

`jest.config`, `playwright.config`, `next.config` 등 루트 레벨 설정 파일을 작성할 때:

```
✅ jest.config.mjs  — ESM (import / export default)
❌ jest.config.js   — CJS require() → @typescript-eslint/no-require-imports 위반
```

- 확장자는 `.mjs` 또는 `.ts`(ts-node 필요)를 사용한다
- CJS `require()` / `module.exports` 사용은 금지한다 (lint-staged 범위에 포함됨)
