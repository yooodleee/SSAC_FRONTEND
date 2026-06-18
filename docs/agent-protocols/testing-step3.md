# Testing Protocol — STEP 3. 테스트 작성 규칙

> 이 파일은 `testing.md`의 STEP 3 세부 작성 규칙입니다.
> 메인 프로토콜: [testing.md](testing.md)

---

## 컴포넌트 테스트 (RTL 기준)

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

## API 연동 테스트 (MSW 기준)

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
- **MSW 서버는 전역 setup이 아닌 테스트 파일 단위로 설정한다** (jsdom 환경 호환성)

```typescript
// API 연동 테스트 파일 상단에 반드시 포함
import { server } from '@/mocks/server';

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

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

## 커스텀 훅 테스트 (renderHook 기준)

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
