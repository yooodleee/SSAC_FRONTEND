# FE Log Diagnosis Protocol (Jest + RTL + MSW)

## 트리거 조건 (자동 실행)

- 런타임 에러 / 콘솔 에러 발생 시
- API 호출 실패 시 (4xx / 5xx)
- 테스트 실패 시
- 빌드 실패 시
- 사용자가 "왜 안되지", "오류", "에러", "안 됨" 언급 시
- self-diagnose.md 실행 결과 이상 감지 시

## 실행 순서

STEP 1. 로그 수집
STEP 2. 로그 분류 및 원인 가설 수립
STEP 3. 원인 검증
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

| 로그 패턴                           | 가설 원인           | 확인 위치                         |
| ----------------------------------- | ------------------- | --------------------------------- |
| Cannot read properties of undefined | null/undefined 참조 | 데이터 로딩 전 렌더링             |
| 401 Unauthorized                    | 토큰 없음 / 만료    | Authorization 헤더 / Refresh 로직 |
| 403 Forbidden                       | 권한 없음           | 사용자 Role / 라우트 가드         |
| 404 Not Found                       | 잘못된 API 경로     | api-contract 경로 확인            |
| 409 Conflict                        | 중복 데이터         | 요청 Body 중복 여부               |
| 500 Server Error                    | BE 서버 오류        | X-Trace-Id → BE 팀 전달           |
| Network Error                       | 서버 미실행 / CORS  | BE 서버 상태 / CORS 설정          |
| Module not found                    | import 경로 오류    | 파일 경로 / 대소문자              |
| Type Error                          | 타입 불일치         | api-types.ts 구조 확인            |
| MSW handler not found               | 핸들러 누락         | src/mocks/handlers 확인           |

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

### 토큰 관련 오류 (401)

□ Axios Interceptor에서 Authorization 헤더가 주입되는가
□ Access Token이 클라이언트에 정상 저장되어 있는가
□ Token 만료 시 Refresh 로직이 동작하는가
□ Refresh 실패 시 로그인 페이지로 리다이렉트 되는가

### API 경로 오류 (404)

□ api-contract/generated/api-types.ts 엔드포인트와 일치하는가
□ 환경 변수 BASE_URL이 올바르게 설정되어 있는가
□ Query Parameter / Path Variable 형식이 올바른가

### 타입 오류

□ api-contract/generated/api-types.ts에서 import하고 있는가
□ src/types/index.ts에 수동 작성한 API 타입이 있는가
□ BE Contract 파일과 현재 타입 정의가 일치하는가

### 테스트 실패

□ MSW 핸들러의 응답 구조가 api-contract 기준과 일치하는가
□ 비동기 처리 시 waitFor / findBy를 올바르게 사용하는가
□ 테스트가 implementation detail에 의존하지 않는가

### CORS 오류

□ BE의 허용 Origin에 FE 개발 서버 주소가 포함되어 있는가
□ 요청 헤더에 허용되지 않은 커스텀 헤더가 포함되어 있는가

### 500 Server Error

□ X-Trace-Id를 기록하고 BE 팀에 전달한다
□ FE에서 수정을 시도하지 않는다

검증 결과 출력 형식:

```
[검증 결과]
✅ Authorization 헤더 주입 확인
❌ Refresh Token 재발급 로직 미동작 확인
→ 원인 확정 : Axios Interceptor Refresh 로직 누락
→ 수정 위치 : src/lib/axiosInstance.ts
```

---

## STEP 4. 수정 및 재진단

## 수정 시 준수 규칙

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

## 진단 결과 기록

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

---

## Vercel 배포 실패 시 로그 수집 절차

### STEP 1. Vercel CLI로 로그 자동 수집

```bash
# 최신 배포 URL 확인
vercel ls

# 해당 배포 로그 조회
vercel logs <deployment-url>

# 자동화 스크립트 사용 (권장)
npm run logs:vercel
```

### STEP 2. 오류 유형 분류

아래 패턴으로 원인을 분류한다:

| 로그 패턴            | 가설 원인            | 확인 위치           |
| -------------------- | -------------------- | ------------------- |
| Type error           | TypeScript 타입 오류 | 해당 파일 라인      |
| Module not found     | import 경로 오류     | 파일 경로 확인      |
| ESLint error         | ESLint 규칙 위반     | .eslintrc 설정      |
| Cannot find module   | 의존성 누락          | package.json        |
| Environment variable | 환경 변수 누락       | Vercel Variables    |
| Build exceeded       | 번들 사이즈 초과     | 코드 스플리팅 필요  |
| Out of memory        | 빌드 메모리 부족     | Dynamic import 적용 |

### STEP 3. 원인 검증

```
□ vercel logs 출력 내용 전문 확인
□ 로컬에서 npm run build 실행하여 동일 오류 재현
□ npx tsc --noEmit으로 타입 오류 확인
□ npm run lint로 ESLint 오류 확인
□ Vercel 대시보드 Environment Variables 확인
```

### STEP 4. 수정 및 재배포

```
□ 원인 확정 후 코드 또는 환경 변수 수정
□ 로컬 npm run build 성공 확인
□ git push origin main → Vercel 자동 재배포
□ npm run logs:vercel:live 로 재배포 로그 실시간 확인
```
