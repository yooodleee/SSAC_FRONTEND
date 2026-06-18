# Backlog SC 생성 하네스 — STEP 2. 관련 기존 코드 분석 및 구조 충돌 점검

> 이 파일은 `backlog-generate.md`의 STEP 2 세부 체크리스트입니다.
> 메인 프로토콜: [backlog-generate.md](backlog-generate.md)

---

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

---

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
