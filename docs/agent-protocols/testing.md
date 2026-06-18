# Testing Protocol (Jest + RTL + MSW)

> **[ACTIVE]** Jest 30 + @testing-library/react 16 + MSW 2 설치 완료 (2026-06-11, ADR-002).
> 모든 STEP 실행 가능.

## 트리거 조건

- 신규 컴포넌트 / 페이지 / 훅 구현 완료 시 (자동)
- 신규 API 연동 코드 구현 완료 시 (자동)
- 사용자가 "테스트 작성", "test", "검증" 언급 시 (자동)
- quality.md TD-001 관련 작업 시 (자동)

## 실행 순서

STEP 1. 테스트 대상 분류
STEP 2. 테스트 파일 생성 위치 결정
STEP 3. 테스트 작성 → [testing-step3.md](testing-step3.md)
STEP 4. 테스트 실행 및 커버리지 확인
STEP 5. 자가 점검

---

## STEP 1. 테스트 대상 분류

| 대상            | 테스트 유형                 | 도구                   |
| --------------- | --------------------------- | ---------------------- |
| UI 컴포넌트     | 렌더링 / 인터랙션 테스트    | Jest + RTL             |
| 커스텀 훅       | 훅 동작 테스트              | Jest + RTL(renderHook) |
| API 연동        | 네트워크 요청 / 응답 테스트 | Jest + MSW             |
| 에러 처리       | 에러 상태 렌더링 테스트     | Jest + RTL + MSW       |
| 유틸리티 함수   | 순수 함수 단위 테스트       | Jest                   |
| 페이지 컴포넌트 | 통합 테스트                 | Jest + RTL + MSW       |

→ 하나의 구현물이 여러 유형에 해당하는 경우 모든 유형의 테스트를 작성한다

---

## STEP 2. 테스트 파일 생성 위치

```
src/
├── components/
│   └── Button/
│       ├── Button.tsx
│       └── Button.test.tsx       ← 컴포넌트와 동일 경로
├── hooks/
│   └── useAuth/
│       ├── useAuth.ts
│       └── useAuth.test.ts       ← 훅과 동일 경로
├── pages/
│   └── Home/
│       ├── Home.tsx
│       └── Home.test.tsx         ← 페이지와 동일 경로
└── utils/
    └── format/
        ├── format.ts
        └── format.test.ts        ← 유틸과 동일 경로

MSW 핸들러 위치:
src/mocks/
├── handlers/
│   ├── auth.handler.ts
│   ├── news.handler.ts
│   └── index.ts
└── server.ts                     ← MSW 서버 설정
```

---

## STEP 3. 테스트 작성

→ **[testing-step3.md](testing-step3.md)** 에서 유형별 작성 규칙 및 예시 확인

---

## STEP 4. 테스트 실행 및 커버리지 확인

실행 명령어:

```bash
$ npm run test                    # 전체 테스트 실행
$ npm run test:coverage           # 커버리지 포함 실행
$ npm run test -- --watch         # 워치 모드
```

커버리지 기준 (quality.md TD-001 기준):

- 신규 컴포넌트 : Line Coverage 70% 이상
- 신규 훅 : Line Coverage 80% 이상
- 유틸리티 함수 : Line Coverage 90% 이상

커버리지 미달 시:
→ 구현 완료로 간주하지 않는다
→ 커버리지를 충족할 때까지 테스트를 추가한다

### coverageThreshold 등록 규칙

커버리지 기준을 충족한 파일은 반드시 `jest.config.mjs`의 `coverageThreshold`에 등록한다.
등록하지 않으면 이후 코드 변경으로 커버리지가 낮아져도 CI가 감지하지 못한다.

```js
// jest.config.mjs — coverageThreshold 등록 패턴
coverageThreshold: {
  // 유틸리티 함수 (목표 90%)
  './src/lib/utils.ts': { lines: 85, functions: 85, branches: 80, statements: 85 },

  // 커스텀 훅 (목표 80%)
  './src/hooks/useXxx.ts': { lines: 75, functions: 75, branches: 70, statements: 75 },

  // 컴포넌트 (목표 70%)
  './src/features/home/XxxCard.tsx': { lines: 65, functions: 65, branches: 60, statements: 65 },
},
```

등록 기준:

- 임계값은 **현재 실측 커버리지보다 5~10%p 낮게** 설정한다 (여유 마진)
- 목표 커버리지에 도달하면 임계값을 목표치로 상향한다
- 파일 삭제 또는 이동 시 해당 항목도 함께 제거한다

---

## STEP 5. 테스트 자가 점검

```
□ 모든 테스트가 통과하는가 (npm run test)
□ 커버리지 기준을 충족하는가 (npm run test:coverage)
□ jest.config.mjs coverageThreshold에 해당 파일이 등록되었는가
□ 테스트가 implementation detail에 의존하지 않는가
□ MSW 핸들러가 api-contract 기준 응답 구조를 따르는가
□ 에러 케이스 (4xx/5xx/네트워크 에러) 테스트가 포함되어 있는가
□ 로딩/빈 상태 테스트가 포함되어 있는가
```

위 항목 중 하나라도 NO인 경우 구현 완료로 간주하지 않는다
