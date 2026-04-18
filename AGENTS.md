# AGENTS.md — 에이전트 진입점

> **이 파일은 지도입니다.** 상세 내용은 모두 `docs/`에 있습니다.
> 코드를 작성하기 전에 반드시 아래 순서대로 읽으세요.

---

## 이 프로젝트는 무엇인가

SSAC_FRONTEND는 Next.js 15 App Router 기반의 프론트엔드 애플리케이션입니다.
React 19 + TypeScript (strict) + Tailwind CSS v4 스택을 사용하며, 3인 팀이 AI 에이전트와 함께 개발합니다.

---

## 코드 작성 전 반드시 읽어야 할 파일

| 순서 | 파일 | 이유 |
|---|---|---|
| 1 | [`docs/architecture.md`](docs/architecture.md) | 레이어 구조와 의존성 방향 — 이를 모르면 잘못된 import를 만든다 |
| 2 | [`docs/conventions.md`](docs/conventions.md) | 네이밍, 파일 위치, 컴포넌트 형식 — PR 리젝의 90%는 여기서 발생한다 |
| 3 | [`docs/decisions/`](docs/decisions/) | 과거에 왜 그렇게 결정했는지 — 같은 논쟁을 반복하지 않기 위해 |

---

## 커밋 전 체크리스트

아래 모두 통과한 후에만 커밋하세요.

```bash
npm run build     # 빌드 성공 필수
npm run lint      # ESLint 오류 0개 필수
npm run format    # Prettier 포맷 적용
```

- [ ] `any` 타입을 사용하지 않았다
- [ ] 새 파일이 `docs/architecture.md`의 레이어 규칙에 맞는 위치에 있다
- [ ] 환경 변수를 직접 `process.env`로 접근하지 않고 `src/lib/env.ts`를 통해 접근했다
- [ ] `console.log`를 디버깅 목적으로 남기지 않았다

---

## 금지 행동

| 금지 | 이유 |
|---|---|
| `main` 브랜치에 직접 커밋 | 팀 리뷰 없이 코드가 배포됨 |
| `src/app/`에서 `src/services/` 직접 import | UI → Service 직접 의존 금지, `features/` 를 경유할 것 |
| `any` 타입 사용 | TypeScript strict의 의미가 없어짐 |
| `process.env.XXX` 직접 참조 | `src/lib/env.ts` 경유 필수 |
| 새 npm 패키지 임의 추가 | 팀 논의 후 `docs/decisions/`에 ADR 작성 필요 |
| `docs/` 파일을 수정 없이 방치 | 코드 변경 시 관련 문서도 같이 업데이트 |

---

## 모르는 것이 있을 때

| 질문 유형 | 참고 문서 |
|---|---|
| "이 파일은 어디에 만들어야 하나?" | `docs/architecture.md` → 레이어 구조 |
| "변수/함수 이름은 어떻게 짓나?" | `docs/conventions.md` → 네이밍 규칙 |
| "왜 이렇게 설계됐나?" | `docs/decisions/` → ADR 목록 |
| "처음 세팅은 어떻게 하나?" | `docs/onboarding.md` |
| "현재 기술 부채는 무엇인가?" | `docs/quality.md` |
| "에이전트가 과거에 한 실수는?" | `docs/decisions/` → `mistake-log-*.md` 패턴 파일 |
