# 아키텍처 — 도메인 구조와 의존성 레이어

> 마지막 업데이트: 2026-04-18 | 담당: 팀 전체
> 관련 ADR: [001-initial-architecture](decisions/001-initial-architecture.md)

---

## 레이어 구조 (의존성은 아래 방향만 허용)

```
┌─────────────────────────────────────────┐
│              app/  (라우팅 레이어)         │  ← Next.js 페이지, 레이아웃
│         허용 import: features, components│
└─────────────────┬───────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│           features/  (도메인 레이어)       │  ← 특정 비즈니스 기능 UI
│    허용 import: components, hooks,       │
│                services, types, lib      │
└─────────────────┬───────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│         components/  (UI 레이어)          │  ← 재사용 가능한 순수 UI 컴포넌트
│       허용 import: types, lib            │
│       금지 import: services, features    │
└─────────────────┬───────────────────────┘
                  ↓
┌────────────────────────────────────────────────────┐
│  hooks/ │ services/  (로직 레이어)                   │
│  허용 import: types, lib                            │
│  금지 import: components, features, app             │
└────────────────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│         lib/ │ types/  (기반 레이어)       │  ← 유틸리티, 타입, 환경 변수
│       허용 import: (외부 없음)             │
│       금지 import: 모든 상위 레이어         │
└─────────────────────────────────────────┘
```

### 규칙 요약

| From → To | app | features | components | hooks | services | lib | types |
|---|---|---|---|---|---|---|---|
| **app** | — | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| **features** | ❌ | — | ✅ | ✅ | ✅ | ✅ | ✅ |
| **components** | ❌ | ❌ | — | ✅ | ❌ | ✅ | ✅ |
| **hooks** | ❌ | ❌ | ❌ | — | ✅ | ✅ | ✅ |
| **services** | ❌ | ❌ | ❌ | ❌ | — | ✅ | ✅ |
| **lib** | ❌ | ❌ | ❌ | ❌ | ❌ | — | ✅ |
| **types** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | — |

---

## 디렉토리 역할 정의

### `src/app/`
- Next.js App Router의 페이지 및 레이아웃
- 비즈니스 로직 **없음** — 오직 `features/`를 조립하는 역할
- 파일당 하나의 `default export` (Next.js 페이지 컴포넌트)
- Server Component 기본, Client Component는 필요한 경우에만 `'use client'` 명시

### `src/features/`
- 특정 도메인 기능에 속하는 컴포넌트, 훅, 유틸
- 폴더 구조: `features/<domain>/<ComponentName>.tsx`
- 도메인 간 직접 import 금지 — 공유 필요 시 `components/` 또는 `hooks/`로 이동

### `src/components/`
- 도메인 무관한 재사용 UI 컴포넌트
- `components/ui/` — 원자 단위 (Button, Card, Input 등)
- `components/layout/` — 레이아웃 구조 (Header, Footer, Sidebar)
- Props만으로 동작해야 하며, 내부에서 서비스 호출 금지

### `src/hooks/`
- 여러 feature에서 재사용되는 커스텀 훅
- 특정 feature에서만 쓰이는 훅은 `features/<domain>/` 내에 위치

### `src/services/`
- 모든 외부 API 통신 로직
- `api.ts` — 공통 fetch 래퍼 (헤더, 에러 처리 중앙화)
- `<domain>.ts` — 도메인별 API 메서드 (예: `posts.ts`)
- React 훅 사용 금지 (순수 async 함수)

### `src/lib/`
- 프레임워크 무관한 유틸리티
- `env.ts` — 환경 변수 중앙 관리 (직접 `process.env` 접근 금지)
- `utils.ts` — cn(), formatDate() 등 범용 유틸

### `src/types/`
- 공유 TypeScript 타입 정의
- `index.ts` — 도메인 타입, API 응답 타입, UI 타입
- 특정 컴포넌트에만 쓰이는 타입은 해당 파일 내 `interface`로 정의

---

## 레이어 위반 감지 방법

### 즉시 사용 가능한 방법
ESLint `no-restricted-imports` 규칙으로 가장 흔한 위반을 잡습니다.
현재 설정된 규칙: `eslint.config.mjs` 참고.

### 향후 추가 예정
- `eslint-plugin-import` + `import/no-restricted-paths` 로 레이어별 상세 규칙
- 또는 `dependency-cruiser` 를 통한 아키텍처 구조 테스트

---

## 새 도메인 추가 시 체크리스트

- [ ] `src/types/index.ts`에 도메인 타입 추가
- [ ] `src/services/<domain>.ts` 생성
- [ ] `src/features/<domain>/` 폴더 생성
- [ ] `src/app/<route>/page.tsx` 생성
- [ ] 이 문서의 레이어 표에 변경 없음을 확인
