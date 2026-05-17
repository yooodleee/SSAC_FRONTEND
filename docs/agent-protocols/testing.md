# Testing Protocol (Jest + RTL + MSW)

> **[BLOCKED: TD-001]** Jest + RTL + MSW 미설치 상태.
> STEP 1~3 (테스트 코드 작성) 은 실행 가능하나, **STEP 4~5 (실행 및 검증) 는 실행 불가**.
> 해제 조건: `docs/agent-protocols/adr-create.md` 절차로 ADR 작성 후 Jest 설치 완료 시.
> → 설치 완료 후 이 배너를 삭제한다.

## 트리거 조건

- 신규 컴포넌트 / 페이지 / 훅 구현 완료 시 (자동)
- 신규 API 연동 코드 구현 완료 시 (자동)
- 사용자가 "테스트 작성", "test", "검증" 언급 시 (자동)
- quality.md TD-001 관련 작업 시 (자동)

## 실행 순서

STEP 1. 테스트 대상 분류
STEP 2. 테스트 파일 생성 위치 결정
STEP 3. 테스트 작성 (유형별 규칙 준수)
STEP 4. 테스트 실행 및 커버리지 확인 ← [BLOCKED: TD-001] Jest 미설치
STEP 5. 자가 점검 ← [BLOCKED: TD-001] Jest 미설치

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

## STEP 3. 테스트 작성 규칙

### 컴포넌트 테스트 (RTL 기준)

필수 테스트 항목:

```
□ 기본 렌더링 — 컴포넌트가 정상적으로 마운트되는가
□ Props 반영 — 전달된 props가 UI에 올바르게 반영되는가
□ 사용자 인터랙션 — 클릭/입력 등 이벤트가 정상 동작하는가
□ 로딩 상태 — 로딩 중 스켈레톤/스피너가 표시되는가
□ 에러 상태 — API 실패 시 오류 메시지가 표시되는가
□ 빈 상태 — 데이터 없을 때 Empty State가 표시되는가
```

금지 패턴:

- implementation detail 테스트 금지 (state, ref 직접 접근)
- getByTestId 남용 금지 (getByRole, getByText 우선)
- 스냅샷 테스트 단독 사용 금지

예시)

```typescript
it('로그인 버튼 클릭 시 onLogin 핸들러가 호출된다', async () => {
  const onLogin = jest.fn();
  render(<LoginButton onLogin={onLogin} />);
  await userEvent.click(screen.getByRole('button', { name: '로그인' }));
  expect(onLogin).toHaveBeenCalledTimes(1);
});
```

---

### API 연동 테스트 (MSW 기준)

필수 테스트 항목:

```
□ 정상 응답 — API 성공 시 데이터가 화면에 렌더링되는가
□ 에러 응답 — 4xx/5xx 응답 시 ErrorCode 기반 메시지가 표시되는가
□ 네트워크 에러 — 네트워크 단절 시 오류 안내가 표시되는가
□ 로딩 상태 — 응답 대기 중 로딩 UI가 표시되는가
```

MSW 핸들러 작성 규칙:

- 핸들러는 반드시 api-contract 기준 응답 구조를 따른다
- 성공/실패 핸들러를 분리하여 작성한다
- 테스트별 핸들러 오버라이드는 `server.use()`를 활용한다

예시)

```typescript
// src/mocks/handlers/news.handler.ts
export const newsHandlers = [
  http.get('/api/news', () => {
    return HttpResponse.json({
      totalCount: 2,
      hasNext: false,
      contents: [mockNews1, mockNews2],
    });
  }),
];

// 에러 케이스 오버라이드
server.use(
  http.get('/api/news', () => {
    return HttpResponse.json({ status: 500, code: 'SERVER-001', message: '...' }, { status: 500 });
  }),
);
```

---

### 커스텀 훅 테스트 (renderHook 기준)

필수 테스트 항목:

```
□ 초기 상태 — 훅의 초기 반환값이 올바른가
□ 상태 변경 — act() 이후 상태가 올바르게 변경되는가
□ 에러 처리 — 에러 발생 시 에러 상태가 올바르게 반환되는가
□ 의존성 — 외부 의존성(API 등)이 올바르게 호출되는가
```

예시)

```typescript
it('useNotification이 unreadCount를 올바르게 반환한다', async () => {
  const { result } = renderHook(() => useNotification());
  await waitFor(() => {
    expect(result.current.unreadCount).toBe(3);
  });
});
```

---

## STEP 4. 테스트 실행 및 커버리지 확인 〔BLOCKED: TD-001〕

> Jest 미설치로 이 단계는 실행 불가. Jest 설치 후 아래 절차를 진행한다.

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

---

## STEP 5. 테스트 자가 점검 〔BLOCKED: TD-001〕

> Jest 미설치로 이 단계는 실행 불가. Jest 설치 후 아래 항목을 확인한다.

```
□ 모든 테스트가 통과하는가 (npm run test)
□ 커버리지 기준을 충족하는가 (npm run test:coverage)
□ 테스트가 implementation detail에 의존하지 않는가
□ MSW 핸들러가 api-contract 기준 응답 구조를 따르는가
□ 에러 케이스 (4xx/5xx/네트워크 에러) 테스트가 포함되어 있는가
□ 로딩/빈 상태 테스트가 포함되어 있는가
```

위 항목 중 하나라도 NO인 경우 구현 완료로 간주하지 않는다
