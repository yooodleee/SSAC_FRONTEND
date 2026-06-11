# 품질 현황 & 기술 부채 레지스트리

> 마지막 업데이트: 2026-04-18
> Last evaluated: 2026-05-04
> 이 파일은 매 스프린트 리뷰 시 갱신합니다.

---

## 품질 등급 기준

| 등급      | 의미                                      |
| --------- | ----------------------------------------- |
| 🟢 Green  | 안정적. 변경 시 회귀 위험 낮음            |
| 🟡 Yellow | 작동하나 리팩터링이 필요한 수준           |
| 🔴 Red    | 즉시 개선 필요. 새 기능 추가 전 해결 권장 |
| ⚪ N/A    | 해당 영역 미구현                          |

---

## 영역별 현재 품질

| 영역                | 등급      | 설명                                                                   |
| ------------------- | --------- | ---------------------------------------------------------------------- |
| 빌드 파이프라인     | 🟡 Yellow | 기본 `next build` 작동, CI 미구성                                      |
| 타입 안전성         | 🟢 Green  | strict mode, `any` 금지 규칙 적용                                      |
| 컴포넌트 구조       | 🟢 Green  | 초기 구조 클린, Button/Card 검증 완료                                  |
| API / 서비스 레이어 | 🟡 Yellow | fetch 래퍼 존재, 에러 재시도 로직 없음                                 |
| 테스트 커버리지     | 🟡 Yellow | Jest 30+RTL 16+MSW 2 설치 완료 (2026-06-11). 커버리지 0%, 작성 진행 중 |
| 스타일 일관성       | 🟡 Yellow | Tailwind 설정 완료, 디자인 토큰 일부만 정의                            |
| 접근성 (a11y)       | 🔴 Red    | aria 속성 검사 없음                                                    |
| 성능 모니터링       | ⚪ N/A    | 미구현                                                                 |
| 에러 바운더리       | 🟡 Yellow | HTTP 에러 처리·토스트 UI 완료, ErrorBoundary 미완료                    |
| 보안 헤더           | 🔴 Red    | next.config.ts에 보안 헤더 미설정                                      |

---

## 알려진 기술 부채

### TD-001 | 테스트 커버리지 부족 (인프라 완료)

> 재평가 일자: 2026-06-11

- **영향도**: 🟡 중간 (인프라 완료로 하향 조정)
- **설명**: Jest 30 + RTL 16 + MSW 2 설치 완료. 신규 구현물부터 테스트 작성 적용. 기존 코드 커버리지 0%.
- **해결 방향**: 신규 컴포넌트/훅/서비스부터 testing.md 기준 적용 (컴포넌트 70%, 훅 80%, 유틸 90%)
- **예상 작업량**: 지속적 (스프린트별 신규 코드에 적용)
- **담당**: 미정

**완료된 항목 (2026-06-11)**

- [x] ADR-002 작성 (docs/decisions/002-jest-rtl-msw-testing.md)
- [x] Jest 30 + @testing-library/react 16 + MSW 2 + @types/jest 설치
- [x] jest.config.js, jest.setup.ts 설정
- [x] src/mocks/server.ts, src/mocks/handlers/index.ts 생성
- [x] npm run test / test:coverage / test:watch 스크립트 추가
- [x] testing.md BLOCKED 배너 제거
- [x] utils.ts 유틸리티 함수 최초 테스트 6건 통과

### TD-002 | 에러 바운더리 없음 (일부 완료)

> 재평가 일자: 2026-05-04

- **영향도**: 🟡 중간 (일부 완료로 하향 조정)
- **설명**: 컴포넌트 렌더링 오류가 전체 페이지를 크래시시킵니다.
- **해결 방향**: `app/error.tsx` + `app/global-error.tsx` 추가, React Error Boundary 컴포넌트
- **예상 작업량**: 0.2 스프린트 (잔여)

**재평가 결과 (2026-05-04)**

- [x] ErrorCode 기반 에러 메시지 분기 처리 완료 — `src/lib/errorMessages.ts`, `src/constants/errorMessages.ts` (SSACFE-C6, SSACFE-C7)
- [x] HTTP 상태 코드별 분기 처리 완료 — `src/services/api.ts` 개선 (SSACFE-C6)
- [x] 에러 상태 UI (토스트) 구현 완료 — `src/components/ui/ErrorToast.tsx` (SSACFE-C6)
- [ ] ErrorBoundary 적용 미완료 — `src/app/error.tsx`, `src/app/global-error.tsx` 없음

### TD-003 | API 에러 재시도 없음

- **영향도**: 🟡 중간
- **설명**: `useFetch`가 실패 시 단순 에러 상태만 표시. 네트워크 순단에 취약.
- **해결 방향**: exponential backoff 재시도 로직 추가 또는 React Query 도입
- **예상 작업량**: 1 스프린트

### TD-004 | 보안 헤더 미설정

- **영향도**: 🔴 높음 (프로덕션 배포 전 필수)
- **설명**: `Content-Security-Policy`, `X-Frame-Options` 등 보안 헤더가 없습니다.
- **해결 방향**: `next.config.ts`에 `headers()` 설정 추가
- **예상 작업량**: 0.2 스프린트

### TD-005 | 접근성 검사 없음

- **영향도**: 🟡 중간
- **설명**: Button 등 UI 컴포넌트에 aria 속성이 불완전합니다.
- **해결 방향**: `eslint-plugin-jsx-a11y` 도입
- **예상 작업량**: 0.5 스프린트

---

## 다음 스프린트 우선순위

1. **TD-002** — 에러 바운더리 (빠른 UX 개선, 작업량 적음)
2. **TD-001** — 테스트 프레임워크 도입 (이후 모든 작업의 안전망)
3. **TD-004** — 보안 헤더 (배포 전 필수)

---

## 부채 등록 방법

새 기술 부채 발견 시:

1. 이 파일에 `TD-xxx` 항목 추가
2. 영향도(높음/중간/낮음)와 해결 방향 반드시 기술
3. PR에 `tech-debt` 라벨 추가
