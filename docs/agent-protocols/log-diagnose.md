# FE Log Diagnosis Protocol

## 트리거 조건 (자동 실행)

- 런타임 에러 / 콘솔 에러 발생 시
- API 호출 실패 시 (4xx / 5xx)
- 테스트 실패 시
- 빌드 실패 시
- 사용자가 "왜 안되지", "오류", "에러", "안 됨" 언급 시
- self-diagnose.md 실행 결과 이상 감지 시
- **Vercel 배포 실패** → [log-diagnose-vercel.md](log-diagnose-vercel.md) 실행

## 실행 순서

STEP 1. 로그 수집
STEP 2. 로그 분류 및 원인 가설 수립
STEP 3. 원인 검증 → [log-diagnose-step3.md](log-diagnose-step3.md) 참조
STEP 4. 수정 및 재진단
STEP 5. 진단 결과 기록

---

## STEP 1. 로그 수집

### 런타임 에러 발생 시

1. 브라우저 콘솔 에러 메시지 전문 확인
2. 에러 발생 컴포넌트 / 훅 / 파일 위치 확인
3. React ErrorBoundary 캐치 내용 확인
4. 에러 발생 직전 사용자 인터랙션 확인

### API 호출 실패 시

**⚠️ 코드 수정 전 반드시 요청 흐름부터 확인한다 (추측 기반 수정 금지)**

0. 브라우저 Network 탭에서 **실제 요청 URL** 확인
   → 예상 경로(BFF)로 가는가, 아니면 외부 URL로 나가는가
   → 응답 Content-Type이 `application/json`인가, `text/html`인가
1. HTTP 상태 코드 확인
2. 응답 Body의 ErrorCode / message 확인
3. 요청 헤더 (Authorization, X-Request-Id) 확인
4. 요청 Body / Query Parameter 확인
5. X-Trace-Id 기록 → BE 팀 전달용

### 테스트 실패 시

1. 실패한 테스트명 및 파일 위치 확인
2. expect / received 값 비교
3. MSW 핸들러 응답 구조 확인
4. 비동기 처리 방식 (waitFor / findBy) 확인

### 빌드 실패 시

1. 빌드 에러 메시지 전문 확인
2. 에러 발생 파일 및 라인 번호 확인
3. 타입 에러 / import 경로 오류 여부 확인
4. 환경 변수 누락 여부 확인

---

## STEP 2. 로그 분류 및 원인 가설 수립

| 로그 패턴                                              | 가설 원인                         | 확인 위치                                         |
| ------------------------------------------------------ | --------------------------------- | ------------------------------------------------- |
| Cannot read properties of undefined                    | null/undefined 참조               | 데이터 로딩 전 렌더링                             |
| 401 Unauthorized                                       | 토큰 없음 / 만료                  | Authorization 헤더 / Refresh 로직                 |
| 403 Forbidden                                          | 권한 없음                         | 사용자 Role / 라우트 가드                         |
| 404 Not Found                                          | 잘못된 API 경로 **또는 환경변수** | **Network 탭 실제 URL 먼저 확인** → api-contract  |
| 409 Conflict                                           | 중복 데이터                       | 요청 Body 중복 여부                               |
| 500 Server Error                                       | BE 서버 오류                      | X-Trace-Id → BE 팀 전달                           |
| Network Error                                          | 서버 미실행 / CORS                | BE 서버 상태 / CORS 설정                          |
| Module not found                                       | import 경로 오류                  | 파일 경로 / 대소문자                              |
| Type Error                                             | 타입 불일치                       | api-types.ts 구조 확인                            |
| MSW handler not found                                  | 핸들러 누락                       | src/mocks/handlers 확인                           |
| Unexpected token '<', "<!DOCTYPE"... is not valid JSON | BFF 미도달 / 환경변수 오설정      | **Network 탭 실제 URL 확인 → 환경변수 검증 섹션** |

가설 출력 형식:

```
[진단 결과]
- 에러 유형  : 401 Unauthorized
- 가설 원인  : Access Token 만료 또는 헤더 누락
- 확인 필요  : Axios Interceptor Authorization 헤더 주입 여부
- 관련 파일  : src/lib/axiosInstance.ts
- X-Trace-Id : (있는 경우 기록)
```

---

## STEP 3. 원인 검증

→ **[log-diagnose-step3.md](log-diagnose-step3.md)** 에서 오류 유형별 체크리스트 실행

---

## STEP 4. 수정 및 재진단

□ 원인이 확정된 경우에만 코드를 수정한다
→ 원인 불명 상태에서 추측 기반 수정 금지

□ 수정 범위를 최소화한다
→ 원인과 무관한 코드를 함께 수정하지 않는다

□ 수정 완료 후 아래 순서로 재진단한다

1. 동일한 오류가 재현되지 않는가 확인
2. 수정으로 인해 새로운 오류가 발생하지 않는가 확인
3. 관련 테스트가 통과하는가 확인 (npm run test)

□ 500 Server Error 발생 시 FE에서 해결 불가능한 경우
→ X-Trace-Id를 기록하고 BE 팀에 전달한다
→ 수정을 시도하지 않는다

재진단 결과 출력 형식:

```
[재진단 결과]
✅ 오류 해소 확인
✅ 신규 오류 없음 확인
✅ 관련 테스트 통과 확인
→ 진단 완료
```

---

## STEP 5. 진단 결과 기록

아래 형식으로 docs/debug-log.md에 기록한다:

```
---
## [날짜] 진단 기록

- 오류 유형  : 401 Unauthorized
- 발생 위치  : src/hooks/useNotification.ts
- 원인       : Axios Interceptor Refresh 로직 누락
- 수정 내용  : axiosInstance.ts Refresh Token 재발급 로직 추가
- X-Trace-Id : (있는 경우 기록)
- 재발 방지  : testing.md 에러 케이스 테스트 추가
---
```

동일한 오류가 반복되는 경우:
→ quality.md 기술 부채 항목에 추가한다
→ 반복 횟수가 3회 이상인 경우 adr-create.md를 실행한다
