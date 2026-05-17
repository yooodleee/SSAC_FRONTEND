# Backlog SC 생성 하네스 (FE)

## 역할

외부에서 제공된 백로그 SC를 그대로 사용하지 않는다.
반드시 프로젝트 구조와 맥락을 먼저 파악한 후
기존 코드와 충돌 없는 SC를 직접 생성하거나 수정한다.

## 트리거 조건 (자동 실행)

- 사용자가 백로그 SC를 제공했을 때
- 사용자가 "백로그", "SC", "구현해줘" 언급 시
- 새로운 기능 추가 요청을 받았을 때
- sc-harness.md 실행 완료 직후

## 실행 순서

STEP 1. 프로젝트 구조 파악
STEP 2. 관련 기존 코드 분석
STEP 3. 제공된 SC 검토
STEP 4. 충돌 감지 및 SC 수정
STEP 5. 최종 SC 확정 및 출력

---

## STEP 1. 프로젝트 구조 파악

백로그 SC 검토 전 반드시 아래 항목을 확인한다:

### 1-1. 디렉터리 구조 확인

src/ 디렉터리 구조 파악
-> app/ 라우팅 구조 확인
-> components/ 기존 컴포넌트 목록 확인
-> hooks/ 기존 커스텀 훅 목록 확인

### 1-2. 핵심 파일 목록 확인

아래 파일을 순서대로 읽는다:

□ CLAUDE.md
-> 전역 규칙 / 프로토콜 실행 순서 파악

□ AGENTS.md
-> API 계약 규칙 / 타입 작성 규칙 파악

□ DESIGN.md
-> 컬러 토큰 / 타이포그래피 / 컴포넌트 원칙 파악

□ api-contract/generated/api-types.ts
-> 기존 API 타입 전체 목록 파악
-> 신규 타입 추가 여부 결정 시 중복 방지

□ src/constants/errorMessages.ts
-> 기존 ErrorCode 매핑 목록 파악
-> 신규 ErrorCode 추가 여부 결정

□ src/lib/axiosInstance.ts
-> 기존 Axios 설정 파악
-> Interceptor 구현 방식 확인
-> withCredentials 설정 여부 확인

□ src/app/ 라우팅 구조
-> 기존 페이지 경로 전체 목록 파악
-> 신규 페이지 경로 중복 방지

□ contract/api-spec.yaml
-> 기존 API 경로 / 응답 구조 파악

### 1-3. 관련 컴포넌트 / 훅 확인

SC와 관련된 기존 파일을 읽는다:
□ 관련 페이지 파일 (app/.../ page.tsx)
□ 관련 컴포넌트 파일
□ 관련 커스텀 훅 파일
□ 관련 MSW 핸들러 파일

파악 완료 후 아래 형식으로 출력한다:

```
[프로젝트 구조 파악 완료]
- 기존 페이지 경로 수 : N개
- 기존 컴포넌트 수 : N개
- 기존 커스텀 훅 수 : N개
- withCredentials 설정 : true / false
- 관련 파일: XxxPage / useXxx / XxxComponent
```

---

## STEP 2. 관련 기존 코드 분석

SC와 관련된 기존 코드를 아래 기준으로 분석한다:

### 2-1. 기존 라우팅 분석

□ SC에서 언급된 페이지 경로가 이미 존재하는가?
-> 존재: 기존 페이지 수정 / 미존재: 신규 페이지 생성
□ 기존 라우트 가드 구현 방식은 무엇인가?
-> middleware.ts / layout.tsx 방식 확인

### 2-2. 기존 API 연동 분석

□ SC에서 요구하는 API 연동이 이미 구현되어 있는가?
-> 기존 훅 재사용 / 확장 여부 결정
□ 기존 Axios 인터셉터에서 처리하는 ErrorCode 목록은?
-> 신규 ErrorCode 처리 로직 추가 여부 결정
□ withCredentials 설정이 이미 되어 있는가?
-> 쿠키 기반 인증 API 연동 시 필수 확인

### 2-3. 기존 컴포넌트 분석

□ SC에서 요구하는 컴포넌트가 이미 존재하는가?
-> 재사용 / 확장 / 신규 생성 여부 결정
□ 기존 컴포넌트의 Props 구조는 무엇인가?
□ DESIGN.md 설계 지침과 일치하는가?

### 2-4. 기존 타입 분석

□ SC에서 요구하는 타입이 api-types.ts에 존재하는가?
-> 존재: import 사용 / 미존재: BE 팀에 Contract 갱신 요청
□ SC에서 UI 전용 타입이 필요한가?
-> src/types/index.ts에 "// UI-only type" 주석과 함께 추가

### 2-5. 기존 ErrorCode 분석

□ SC에서 요구하는 ErrorCode가 errorMessages.ts에
이미 존재하는가?
□ 신규 ErrorCode가 Contract 파일과 일치하는가?
-> npm run validate:error-mapping 실행 필요

분석 완료 후 아래 형식으로 출력한다:

```
[기존 코드 분석 완료]
- 기존 페이지 존재 여부 : 존재 / 미존재
- 기존 훅 재사용 가능 : useAuth 재사용 가능
- withCredentials 설정 : true (설정 완료)
- 관련 ErrorCode : AUTH-005 기존 등록됨
```

---

## STEP 3. 제공된 SC 검토

외부에서 제공된 SC를 아래 기준으로 검토한다:

### 3-1. 페이지 / 라우팅 검토

□ SC에서 제시한 페이지 경로가 기존과 중복되는가?
□ 라우트 가드 방식이 기존 구현과 일치하는가?
□ 히스토리 처리 방식이 명시되어 있는가?
-> router.push() / router.replace() 구분

### 3-2. API 연동 검토

□ SC에서 요구하는 API 요청 방식이 올바른가?
-> Refresh Token 관련 API: body 없이 / 쿠키 자동 포함
-> withCredentials: true 설정 여부 확인
□ SC에서 요구하는 응답 파싱 방식이 올바른가?
-> ApiResponse 래퍼 구조 준수 여부 확인

### 3-3. ErrorCode 검토

□ SC에서 제시한 ErrorCode가 Contract 파일과 일치하는가?
□ SC에서 제시한 ErrorCode가 errorMessages.ts에
누락된 항목이 있는가?

### 3-4. 타입 검토

□ SC에서 요구하는 타입이 api-types.ts에 존재하는가?
□ UI 전용 타입과 API 타입이 올바르게 구분되어 있는가?

### 3-5. DESIGN.md 검토

□ SC에서 요구하는 UI가 DESIGN.md 컬러 토큰을 사용하는가?
□ 터치 영역이 48px 이상인가?
□ 로딩 / 빈 상태 / 에러 상태가 모두 포함되어 있는가?

검토 완료 후 아래 형식으로 출력한다:

```
[SC 검토 결과]
✅ 적합 항목 : N개
❌ 충돌 항목 : N개
⚠️ 주의 항목 : N개
```

---

## STEP 4. 충돌 감지 및 SC 수정

STEP 3에서 발견된 충돌 항목을 아래 기준으로 수정한다:

### 충돌 유형별 수정 방법

[API 요청 방식 충돌]
원본: body에 refreshToken 포함하여 API 호출
수정: body 없이 호출 (withCredentials: true로 쿠키 자동 포함)
근거: axiosInstance.ts withCredentials 설정 확인

[ErrorCode 누락]
원본: SC에 AUTH-011 처리 로직 없음
수정: Axios Interceptor에 AUTH-011 분기 추가
errorMessages.ts에 AUTH-011 메시지 추가
근거: contract/error-contract.yml AUTH-011 정의 확인

[페이지 경로 중복]
원본: /signup/nickname (이미 존재)
수정: 기존 페이지 수정으로 처리
근거: src/app/(auth)/signup/nickname/page.tsx 존재 확인

[타입 수동 정의]
원본: interface AuthStatus { ... } 수동 정의
수정: api-types.ts에서 import하여 사용
근거: AGENTS.md API 계약 규칙 준수

[DESIGN.md 미준수]
원본: 버튼 height: 40px
수정: 버튼 height: 48px (최소 터치 영역)
근거: DESIGN.md 컴포넌트 설계 원칙

수정 완료 후 아래 형식으로 출력한다:

```
[충돌 수정 완료]
수정 항목 1:
- 원본: body에 { "refreshToken": "string" } 포함
- 수정: body 없이 호출 (쿠키 자동 포함)
- 근거: axiosInstance.ts withCredentials: true 확인

수정 항목 2:
- 원본: AUTH-006 (재사용 토큰) 처리 누락
- 수정: AUTH-012로 변경 후 즉시 로그아웃 처리 추가
- 근거: contract/error-contract.yml 최신 정의 확인
```

---

## STEP 5. 최종 SC 확정 및 출력

수정이 완료된 SC를 아래 형식으로 최종 출력한다:

## 최종 Success Criteria (FE 구현 기준)

### 검토 요약

- 원본 SC 항목 수: N개
- 충돌 없음 (유지): N개
- 수정 완료: N개
- 제외 (BE 관심사): N개

### 충돌 수정 내역

[수정 1] {수정 항목}
❌ 수정 전: {원본}
✅ 수정 후: {수정본}
근거: {기존 코드 / 파일명}

### 최종 SC 목록

1. {항목 1}
2. {항목 2}
   ...

-> 최종 SC 확정 완료.
sc-structure-check.md를 실행합니다.
