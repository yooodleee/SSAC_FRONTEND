# SC 프로젝트 구조 점검 하네스 (FE)

## 트리거 조건 (자동 실행)

- SC가 포함된 작업 지시를 받았을 때
- 새로운 페이지 / 컴포넌트 / API 연동 추가 요청 시
- sc-harness.md 실행 완료 직후

## 실행 순서

STEP 1. 현재 프로젝트 구조 파악
STEP 2. SC 항목별 구조 충돌 점검
STEP 3. 점검 결과 출력
STEP 4. 진행 여부 판단

---

## STEP 1. 현재 프로젝트 구조 파악

작업 시작 전 아래 항목을 확인한다:

### 디렉토리 구조 확인

```
src/
├── app/                ← Next.js App Router 페이지
│   ├── (auth)/         ← 인증 관련 페이지 그룹
│   ├── (main)/         ← 메인 서비스 페이지 그룹
│   └── layout.tsx
├── components/         ← 공통 컴포넌트
│   ├── ui/             ← 기본 UI 컴포넌트
│   └── shared/         ← 공통 비즈니스 컴포넌트
├── hooks/              ← 커스텀 훅
├── lib/                ← 유틸리티 / axios 인스턴스
├── types/              ← UI 전용 타입 (api-types 제외)
├── constants/          ← 상수 / ErrorCode 매핑
├── mocks/              ← MSW 핸들러
└── styles/             ← 전역 스타일 / 토큰
```

### 확인 항목

```
□ 새로 추가할 페이지 경로가 이미 존재하는가?
□ 새로 추가할 컴포넌트명이 기존과 중복되는가?
□ 새로 추가할 API 연동이 기존 훅과 중복되는가?
□ 새로 추가할 타입이 api-types.ts에 이미 존재하는가?
□ 새로 추가할 ErrorCode가 errorMessages.ts에 존재하는가?
□ DESIGN.md 설계 지침과 충돌하는 UI가 있는가?
```

---

## STEP 2. SC 항목별 구조 충돌 점검

### 페이지 / 라우팅 점검

```
□ 새로 추가할 페이지 경로가 기존 경로와 중복되는가?
  → 확인: src/app/ 디렉토리 구조 전체 확인
  예) 기존: src/app/(auth)/signup/nickname/page.tsx
      신규: src/app/(auth)/signup/nickname/page.tsx ← 중복 ❌

□ 페이지 경로 네이밍 컨벤션을 준수하는가?
  → 기준: kebab-case 소문자
  예) ✅ /signup/user-type
      ❌ /signup/userType

□ 라우트 그룹 배치가 적절한가?
  → 인증 관련: (auth) 그룹
  → 메인 서비스: (main) 그룹
  → 온보딩: (auth) 또는 별도 (onboarding) 그룹
```

### 컴포넌트 점검

```
□ 새로 추가할 컴포넌트명이 기존과 중복되는가?
  → 확인: src/components/ 전체 파일명 검색
  예) 기존: Button.tsx
      신규: Button.tsx ← 중복 ❌ → PrimaryButton.tsx로 변경

□ 컴포넌트 배치 위치가 적절한가?
  → 특정 페이지 전용: 해당 페이지 폴더 내부
  → 2개 이상 페이지 공유: components/shared/
  → 기본 UI 요소: components/ui/

□ DESIGN.md 컴포넌트 설계 원칙을 준수하는가?
  → 버튼 height 최소 48px 확인
  → 컬러 토큰 사용 여부 확인
  → 로딩 / 빈 상태 / 에러 상태 구현 여부 확인
```

### API 연동 / 훅 점검

```
□ 동일한 API를 호출하는 커스텀 훅이 이미 존재하는가?
  → 확인: src/hooks/ 전체 파일 확인
  → 중복 시 기존 훅 재사용 또는 확장

□ API 타입이 api-contract/generated/api-types.ts에 존재하는가?
  → 존재: import하여 사용
  → 미존재: BE 팀에 Contract 갱신 요청 후 대기

□ MSW 핸들러가 api-contract 기준 응답 구조를 따르는가?
  → 확인: src/mocks/handlers/ 기존 핸들러 구조 참고
```

### 타입 점검

```
□ 새로 추가할 타입이 api-types.ts에 이미 존재하는가?
  → 중복 타입 정의 금지
  → api-types.ts에서 import하여 사용

□ UI 전용 타입임이 명확한가?
  → UI 전용인 경우만 src/types/index.ts에 추가 허용
  → "// UI-only type" 주석 필수
```

### ErrorCode 점검

```
□ 새로 추가할 ErrorCode가 src/constants/errorMessages.ts에 이미 존재하는가?
  → 중복 추가 금지

□ Contract 파일의 ErrorCode와 일치하는가?
  → npm run validate:error-mapping 실행 확인
```

### DESIGN.md 설계 지침 점검

```
□ 새로 추가할 UI가 DESIGN.md 컬러 시스템을 따르는가?
  → 임의 색상 하드코딩 금지
□ 타이포그래피 스케일을 준수하는가?
□ 금융 용어에 툴팁이 적용되었는가?
□ 난이도 태그(🌱/🌿/🌳)가 적용되었는가?
  (콘텐츠 관련 SC인 경우)
```

---

## STEP 3. 점검 결과 출력

아래 형식으로 점검 결과를 출력한다:

```
## FE 프로젝트 구조 점검 결과

### 페이지 / 라우팅
✅ /signup/type — 기존 경로와 충돌 없음
❌ /signup/nickname — 기존 페이지 존재
   → 기존 페이지 수정으로 처리 필요

### 컴포넌트
✅ UserTypeCard — 기존 컴포넌트와 중복 없음
⚠️ StepIndicator — 기존 ProgressBar와 유사
   → 기존 컴포넌트 재사용 또는 확장 검토 필요

### API 연동 / 훅
✅ useUserType — 기존 훅과 중복 없음
❌ useAuth — 기존 훅 존재
   → 기존 useAuth에 userType 관련 메서드 추가로 처리

### 타입
✅ UserType — api-types.ts에 존재 → import 사용
❌ UserProfile — src/types/index.ts에 수동 정의됨
   → api-types.ts 확인 후 중복 제거 필요

### ErrorCode
✅ USER-TYPE-001 — errorMessages.ts에 미등록
   → 추가 필요
⚠️ validate:error-mapping 미실행
   → 실행 후 Contract 일치 여부 확인 필요

### DESIGN.md 설계 지침
✅ 컬러 토큰 사용 예정
✅ 버튼 height 48px 예정
⚠️ 금융 용어 툴팁 미확인
   → 콘텐츠 확정 후 툴팁 적용 여부 검토 필요

## 점검 요약
- 전체 SC 항목 수 : N개
- ✅ 구조 적합     : N개
- ❌ 구조 충돌     : N개 → 수정 후 진행 필요
- ⚠️ 주의 필요     : N개 → 검토 후 진행
```

---

## STEP 4. 진행 여부 판단

```
if (❌ 구조 충돌 항목이 1개 이상):
  → 구현을 시작하지 않는다
  → 충돌 항목 목록을 출력한다
  → "기존 프로젝트 구조와 충돌이 발견되었습니다.
     위 항목을 검토 후 SC를 수정하여 다시 진행해주세요."
  → 대기한다

if (⚠️ 주의 항목만 존재):
  → 주의 항목 내용을 출력한다
  → "주의가 필요한 항목이 있습니다.
     검토 후 진행 여부를 결정해주세요."
  → 사용자 확인 후 진행한다

if (모든 항목 ✅):
  → "프로젝트 구조 점검 완료. 구현을 시작합니다."
  → 구현을 진행한다
```
