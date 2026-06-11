# ADR-002: Jest + RTL + MSW 테스트 인프라 도입

| 항목          | 내용        |
| ------------- | ----------- |
| 날짜          | 2026-06-11  |
| 상태          | Accepted    |
| 담당 에이전트 | Claude Code |

## 컨텍스트

TD-001로 등록된 기술 부채. 현재 프로젝트에 테스트가 전혀 없어 리팩터링/버그 수정 시 회귀를 감지할 수단이 없음.
`testing.md` 프로토콜 전체가 BLOCKED 상태이며, `pr-checklist.md` STEP 4도 항상 ⚠️로만 통과 중.

## 결정 사항

**Jest 29 + @testing-library/react 16 + MSW 2** 조합을 채택한다.

- **Jest 29**: 현재 Next.js 16 공식 문서 권장 테스트 러너. SWC 기반 `next/jest` 트랜스폼 지원.
- **@testing-library/react 16**: React 19 공식 지원 버전.
- **MSW 2**: API 모킹 표준. Node.js 환경에서 `@mswjs/interceptors` 기반 동작.
- **트랜스폼**: `next/jest` (SWC) — Babel 불필요, 기존 Next.js 빌드와 동일한 컴파일러 사용.

## 고려한 대안

| 대안              | 거부 이유                                                                          |
| ----------------- | ---------------------------------------------------------------------------------- |
| Vitest            | Next.js App Router 환경에서 Server Component 테스트 지원이 불완전 (2026-06 기준)   |
| Playwright (단독) | 단위/컴포넌트 테스트 불가. 현재 @playwright/test는 e2e 전용으로 이미 devDep 등록됨 |
| Babel + Jest      | SWC 대비 속도 느림. next/jest 사용 시 Babel 불필요                                 |

## 트레이드오프

**얻는 것**: 컴포넌트/훅/서비스 레이어 회귀 감지, testing.md 프로토콜 전체 해제, PR 체크리스트 STEP 4 정상화

**잃는 것**: 초기 테스트 작성 비용 (신규 구현물부터 적용, 기존 코드는 TD별 우선순위에 따라 추가)

## 결과

- `jest.config.ts`, `jest.setup.ts`, `src/mocks/` 디렉토리 신규 생성
- `tsconfig.json`에 Jest 타입 참조 추가
- `package.json`에 `test`, `test:coverage`, `test:watch` 스크립트 추가
- `testing.md`의 `[BLOCKED: TD-001]` 배너 제거
- `quality.md` TD-001 상태 🔴 Red → 🟡 Yellow (인프라 완료, 커버리지 달성 진행 중)

## 재검토 시점

- Vitest가 Next.js App Router Server Component를 공식 지원하게 된 시점
- 테스트 실행 시간이 5분을 초과하는 시점 (병렬화 또는 샤딩 검토)
