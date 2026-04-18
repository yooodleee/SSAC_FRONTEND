# ADR-001: 초기 아키텍처 설계

| 항목 | 내용 |
|---|---|
| 날짜 | 2026-04-18 |
| 상태 | Accepted |
| 담당 | 팀 전체 |

---

## 컨텍스트

SSAC_FRONTEND 프로젝트를 3인 팀이 AI 에이전트(Claude Code 등)와 함께 개발합니다.
초기부터 확장 가능한 구조를 잡아야 하며, 에이전트가 반복적으로 같은 구조 실수를 하지 않도록 명확한 레이어 경계가 필요합니다.

주요 고려 사항:
- 팀원 3명이 동시에 서로 다른 기능을 개발해야 한다
- AI 에이전트가 컨텍스트 창 안에서 전체 아키텍처를 파악할 수 있어야 한다
- 초기 단계이므로 과도한 복잡도는 피해야 한다

---

## 결정 사항

### 1. Next.js App Router 채택 (Pages Router 거부)

**이유**: App Router의 React Server Components가 서버/클라이언트 경계를 명확하게 만들고, 향후 스트리밍, 서버 액션 등 최신 기능을 활용할 수 있습니다.

**트레이드오프**: App Router는 Pages Router보다 학습 곡선이 있습니다. 에이전트가 `'use client'` 경계를 잘못 설정할 수 있습니다.

**대응**: `docs/conventions.md`에 Server/Client 컴포넌트 구분 기준 명시.

### 2. 5-레이어 의존성 구조 채택

```
app → features → components → hooks/services → lib/types
```

**이유**: 단방향 의존성을 강제해 순환 참조와 스파게티 import를 방지합니다. 에이전트에게 "이 파일은 어디에 놓아야 하는가"에 대한 명확한 답을 줍니다.

**트레이드오프**: 단순한 기능도 여러 레이어를 만들어야 할 수 있습니다.

**대응**: 특정 feature에서만 쓰이는 훅은 `features/<domain>/` 내에 바로 둘 수 있도록 허용.

### 3. 상태 관리: React hooks 기반으로 시작 (Zustand/React Query 보류)

**이유**: 초기 단계에서 외부 상태 관리 라이브러리 도입은 불필요한 복잡도를 추가합니다. `useFetch` 커스텀 훅으로 시작하고, 실제 필요가 생기면 도입합니다.

**도입 기준**:
- 전역 클라이언트 상태가 3개 이상 생기면 → Zustand 검토
- API 캐싱/무효화가 복잡해지면 → React Query 검토

### 4. API 통신: 커스텀 fetch 래퍼 (axios 보류)

**이유**: Next.js 15의 `fetch`는 캐싱, 재검증 등 프레임워크 기능과 통합됩니다. axios를 추가하면 이 이점을 잃습니다.

**트레이드오프**: axios의 인터셉터, 자동 JSON 변환 등이 없어 보일러플레이트가 약간 늘어납니다.

**대응**: `src/services/api.ts`에서 공통 로직을 중앙화.

### 5. 스타일링: Tailwind CSS v4 (CSS Modules/styled-components 거부)

**이유**: 유틸리티 우선 방식은 에이전트가 스타일을 생성하기 쉽고, 별도 스타일 파일 없이 컴포넌트 파일만 보면 됩니다.

**트레이드오프**: 클래스 문자열이 길어질 수 있습니다.

**대응**: `cn()` 유틸로 조건부 클래스 가독성 유지. `prettier-plugin-tailwindcss`로 순서 자동 정렬.

---

## 결과

- `docs/architecture.md`에 레이어별 import 규칙 문서화
- `eslint.config.mjs`에 `no-restricted-imports` 규칙으로 주요 위반 자동 감지
- 에이전트가 파일 위치를 결정할 때 `docs/architecture.md` 참고 가능

---

## 재검토 시점

- 팀 규모가 5명 이상으로 늘어날 때
- 도메인 수가 10개 이상이 될 때
- 현재 구조로 인한 merge conflict가 잦아질 때
