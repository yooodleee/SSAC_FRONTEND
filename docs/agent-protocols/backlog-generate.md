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
STEP 2. 관련 기존 코드 분석 및 구조 충돌 점검
STEP 3. 제공된 SC 검토
STEP 4. 충돌 감지 및 SC 수정
STEP 5. 최종 SC 확정 및 진행 판단

---

## STEP 1. 프로젝트 구조 파악

백로그 SC 검토 전 반드시 아래 핵심 파일을 순서대로 읽는다:

```
□ AGENTS.md                               → API 계약 규칙 / 타입 작성 규칙
□ DESIGN.md                               → 컬러 토큰 / 타이포그래피 / 컴포넌트 원칙
□ api-contract/generated/api-types.ts     → 기존 API 타입 전체 (중복 방지)
□ src/constants/errorMessages.ts          → 기존 ErrorCode 매핑 목록
□ src/lib/axiosInstance.ts                → Axios 설정 / Interceptor / withCredentials 여부
□ contract/api-spec.yaml                  → 기존 API 경로 / 응답 구조
```

그리고 SC와 관련된 파일을 추가로 읽는다:

```
□ src/app/ 라우팅 구조    → 기존 페이지 경로 전체 (중복 방지)
□ src/components/         → 기존 컴포넌트 목록
□ src/hooks/              → 기존 커스텀 훅 목록
□ 관련 page.tsx / 컴포넌트 / 훅 / MSW 핸들러 파일
```

파악 완료 후 출력:

```
[프로젝트 구조 파악 완료]
- 기존 페이지 경로 수 : N개
- 기존 컴포넌트 수 : N개
- 기존 커스텀 훅 수 : N개
- withCredentials 설정 : true / false
- 관련 파일: XxxPage / useXxx / XxxComponent
```

---

## STEP 2. 관련 기존 코드 분석 및 구조 충돌 점검

### 2-1. 라우팅 분석

```
□ SC에서 언급된 페이지 경로가 이미 존재하는가?
   → 존재: 기존 페이지 수정 / 미존재: 신규 생성
□ 페이지 경로 네이밍이 kebab-case 소문자인가?
   ✅ /signup/user-type    ❌ /signup/userType
□ 라우트 그룹 배치가 적절한가?
   → 인증 관련: (auth) / 메인 서비스: (main) / 온보딩: (onboarding)
□ 기존 라우트 가드 구현 방식 (middleware.ts / layout.tsx) 확인
```

### 2-2. API 연동 분석

```
□ SC에서 요구하는 API 연동이 이미 구현되어 있는가?
   → 기존 훅 재사용 / 확장 여부 결정
□ withCredentials 설정이 되어 있는가?
   → 쿠키 기반 인증 API 연동 시 필수
□ Axios 인터셉터에서 처리 중인 ErrorCode 목록 확인
   → 신규 ErrorCode 추가 여부 결정
```

### 2-3. 컴포넌트 분석

```
□ SC에서 요구하는 컴포넌트가 이미 존재하는가?
   → 재사용 / 확장 / 신규 생성 여부 결정
□ 컴포넌트 배치 위치가 적절한가?
   → 특정 페이지 전용 : 해당 페이지 폴더 내부
   → 2개 이상 페이지 공유 : components/shared/
   → 기본 UI 요소 : components/ui/
□ 기존 컴포넌트 Props 구조와 DESIGN.md 지침 일치 여부
```

### 2-4. 타입 분석

```
□ SC에서 요구하는 타입이 api-types.ts에 존재하는가?
   → 존재: import 사용 / 미존재: BE 팀에 Contract 갱신 요청
□ UI 전용 타입이 필요한가?
   → src/types/index.ts에 "// UI-only type" 주석과 함께 추가
```

### 2-5. ErrorCode 분석

```
□ SC에서 요구하는 ErrorCode가 errorMessages.ts에 존재하는가?
□ 신규 ErrorCode가 Contract 파일과 일치하는가?
   → npm run validate:error-mapping 실행 필요
```

분석 완료 후 출력:

```
[기존 코드 분석 완료]
### 페이지 / 라우팅
✅ /my/settings — 기존 경로 없음, 신규 생성
❌ /my/profile — 기존 페이지 존재 → 수정으로 처리

### 컴포넌트
✅ SettingsCard — 중복 없음
⚠️ ProfileImage — 기존 Avatar와 유사 → 재사용 검토

### API 연동 / 훅
✅ useSettings — 중복 없음
❌ useUserInfo — 기존 useAuth에 포함 → 기존 훅 확장

### 타입 / ErrorCode
✅ UserSettings — api-types.ts 존재 → import 사용
⚠️ USER-007 — errorMessages.ts 미등록 → 추가 필요
```

---

## STEP 3. 제공된 SC 검토

### 3-1. 페이지 / 라우팅 검토

```
□ SC에서 제시한 페이지 경로가 기존과 중복되는가?
□ 라우트 가드 방식이 기존 구현과 일치하는가?
□ 히스토리 처리 방식이 명시되어 있는가?
   → router.push() / router.replace() 구분
```

### 3-2. API 연동 검토

```
□ Refresh Token 관련 API: body 없이 / 쿠키 자동 포함 여부
□ ApiResponse 래퍼 구조 준수 여부
```

### 3-3. ErrorCode / 타입 검토

```
□ SC에서 제시한 ErrorCode가 Contract 파일과 일치하는가?
□ SC에서 요구하는 타입이 api-types.ts에 존재하는가?
□ UI 전용 타입과 API 타입이 올바르게 구분되어 있는가?
```

### 3-4. DESIGN.md 검토

```
□ DESIGN.md 컬러 토큰을 사용하는가? (임의 색상 하드코딩 금지)
□ 터치 영역이 48px 이상인가?
□ 로딩 / 빈 상태 / 에러 상태가 모두 포함되어 있는가?
□ 금융 용어에 툴팁이 적용되었는가?
□ 난이도 태그(🌱/🌿/🌳)가 적용되었는가? (콘텐츠 관련 SC인 경우)
```

검토 완료 후 출력:

```
[SC 검토 결과]
✅ 적합 항목 : N개
❌ 충돌 항목 : N개
⚠️ 주의 항목 : N개
```

---

## STEP 4. 충돌 감지 및 SC 수정

충돌 유형별 수정 방법:

```
[API 요청 방식 충돌]
원본: body에 refreshToken 포함하여 API 호출
수정: body 없이 호출 (withCredentials: true로 쿠키 자동 포함)
근거: axiosInstance.ts withCredentials 설정 확인

[ErrorCode 누락]
원본: SC에 AUTH-011 처리 로직 없음
수정: Axios Interceptor에 AUTH-011 분기 + errorMessages.ts 추가
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
```

수정 완료 후 출력:

```
[충돌 수정 완료]
수정 1:
- 원본: body에 { "refreshToken": "string" } 포함
- 수정: body 없이 호출 (쿠키 자동 포함)
- 근거: axiosInstance.ts withCredentials: true 확인
```

---

## STEP 5. 최종 SC 확정 및 진행 판단

```
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
```

### 진행 판단 기준

```
if (❌ 구조 충돌 항목이 1개 이상 && 수정 불가):
  → 구현을 시작하지 않는다
  → 충돌 항목을 출력하고 사용자에게 확인 요청 후 대기

if (⚠️ 주의 항목만 존재):
  → 주의 항목 내용을 출력한다
  → 사용자 확인 후 진행

if (모든 항목 ✅ 또는 수정 완료):
  → "최종 SC 확정 완료. new-feature.md를 실행합니다."
  → 구현을 진행한다
```
