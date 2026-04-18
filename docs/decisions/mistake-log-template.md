# 에이전트 실수 기록 템플릿

> 이 파일은 템플릿입니다.
> 실제 실수 기록은 `mistake-log-<NNN>.md` 형식으로 새 파일을 만드세요.
> 예: `mistake-log-001.md`, `mistake-log-002.md`

---

## ML-NNN: [실수 제목]

| 항목 | 내용 |
|---|---|
| 날짜 | YYYY-MM-DD |
| 발견자 | (팀원 이름 또는 "리뷰 중 발견") |
| 에이전트 | Claude Code / Codex / 기타 |
| 반복 횟수 | N회 (이 실수가 몇 번 반복됐는지) |

### 문제 설명

*에이전트가 무엇을 잘못했는가?*

예: "에이전트가 `src/app/page.tsx`에서 `postsService`를 직접 import했습니다. `features/posts/PostList.tsx`를 경유해야 합니다."

### 근본 원인

*왜 이 실수가 발생했는가?*

예: "레이어 경계 규칙이 ESLint로 강제되지 않았고, AGENTS.md에 명시되어 있었지만 에이전트가 해당 규칙을 무시했습니다."

### 하네스에 추가된 해결책

*이 실수를 방지하기 위해 하네스에 무엇을 추가했는가?*

- [ ] `eslint.config.mjs`에 `no-restricted-imports` 규칙 추가
- [ ] `AGENTS.md`의 금지 행동 목록 업데이트
- [ ] `docs/architecture.md`에 명시적 경고 추가
- [ ] 기타: ___

### 검증 방법

*이 해결책이 실제로 동작하는지 어떻게 확인했는가?*

예: "ESLint를 실행하면 위반 시 `error  Import from 'services' is not allowed in 'app'` 메시지 출력 확인."

---

## 기록 목록

| ID | 날짜 | 실수 요약 | 반복 횟수 | 해결됨 |
|---|---|---|---|---|
| (기록 추가 시 여기에 요약 행 추가) | | | | |
