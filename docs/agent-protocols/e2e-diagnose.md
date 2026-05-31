# E2E 진단 프로토콜

> 에이전트가 Playwright를 통해 FE 브라우저 환경을 진단하고
> 인증/스토리지/네트워크 상태를 수집하기 위한 프로토콜입니다.

---

## 실행 방법

```bash
# 전체 시나리오 진단
npm run e2e:diagnose

# 인증 시나리오만 실행
npm run e2e:diagnose:auth

# API 연동 시나리오만 실행
npm run e2e:diagnose:api
```

환경 변수는 `.env.e2e` 파일에 정의합니다 (gitignore 대상).

---

## FE 전용 수집 항목

### Axios Interceptor 동작 확인

Console Logs에서 아래 패턴을 탐색한다:

탐색 키워드:
→ `"reissue"` : 재발급 시도 여부
→ `"AUTH-011"` : 만료 감지 여부
→ `"AUTH-012"` : 재사용 감지 여부
→ `"clearAuthState"` : 로그아웃 처리 여부
→ `"CORS"` : CORS 오류 여부

### SessionStorage 온보딩 데이터

`onboarding_answers` 존재 → 비로그인 온보딩 완료
`onboarding_answers` 없음 → 온보딩 미완료 또는 제출됨

---

## FE 전용 AI 추론 패턴

### 패턴 1: 토큰 만료 후 자동 재발급 실패

증상:
→ `AUTH-011` 감지됨
→ `reissue` 로그 없음
→ 로그인 페이지로 강제 이동

원인 후보:
A. Axios Interceptor reissue 분기 누락
확인: `src/lib/axiosInstance.ts` → `AUTH-011` 처리 코드
B. Refresh Token 쿠키 미전송
확인: Network에서 `/api/v1/auth/reissue` 요청 시 Cookie 헤더 여부

---

### 패턴 2: Refresh Token 재사용 감지

증상:
→ `AUTH-012` 감지됨
→ `clearAuthState` 로그 존재
→ 강제 로그아웃 발생

원인 후보:
A. 동일 Refresh Token을 2회 이상 사용
확인: Network에서 `/api/v1/auth/reissue` 중복 호출 여부
B. 탭 복수 실행으로 인한 경쟁 조건
확인: 동시 요청 타임스탬프 비교

---

### 패턴 3: CORS 오류

증상:
→ `CORS` 콘솔 오류 감지
→ API 요청 전부 실패

원인 후보:
A. 도메인 불일치 (E2E_TARGET_URL vs E2E_API_URL)
확인: `.env.e2e` 설정값 검토
B. BE CORS 허용 목록 미등록
확인: BE 팀에 도메인 허용 요청

---

### 패턴 4: 온보딩 자동 제출 실패

증상:
→ `sessionStorage.onboarding_answers` 존재
→ 로그인 완료 후 `/onboarding/result` 미이동
→ `/home`으로 이동

원인 후보:
A. sessionStorage 읽기 로직 누락
확인: 로그인 완료 후 sessionStorage 조회 코드
B. `POST /api/v1/onboarding/submit` 미호출
확인: Network에서 submit API 호출 여부

---

### 패턴 5: 로딩 화면 무한 표시

증상:
→ `ssac-loading.gif` 계속 표시
→ `/api/v1/auth/status` 응답 없음

원인 후보:
A. auth/status API 타임아웃
확인: Network에서 auth/status 응답 시간
B. 5초 타임아웃 미동작
확인: Console에서 timeout 로그

---

## 출력 파일

진단 결과는 `scripts/e2e-diagnose/output/` 에 JSON으로 저장됩니다 (gitignore 대상).

```
scripts/e2e-diagnose/output/
  report-auth-<timestamp>.json
  report-api-<timestamp>.json
```

---

## 환경 변수 정의 (`.env.e2e`)

| 변수명           | 설명                           | 예시                  |
| ---------------- | ------------------------------ | --------------------- |
| `E2E_TARGET_URL` | 진단 대상 FE URL               | `https://ssac.io`     |
| `E2E_API_URL`    | 진단 대상 API URL              | `https://api.ssac.io` |
| `E2E_SCENARIO`   | 실행할 시나리오 (`auth`/`api`) | `auth`                |
| `E2E_ADMIN_CODE` | 관리자 코드 (민감 정보)        | `xxxxxxxxxx`          |

---

## 기술 스펙 요약

- 런타임: Playwright Chromium (headless)
- 스크립트 진입점: `scripts/e2e-diagnose/runner.ts`
- 실행 방식: `tsx` via npm scripts
- 출력: JSON 리포트 + Playwright 스크린샷/트레이스
- gitignore 등록: `.env.e2e`, `scripts/e2e-diagnose/output/`
