# 코딩 컨벤션

> 마지막 업데이트: 2026-04-18
> 이 파일의 모든 규칙은 ESLint/Prettier로 자동 강제되거나, PR 리뷰에서 검사됩니다.

---

## 네이밍 규칙

### 파일 & 디렉토리

| 대상 | 규칙 | 예시 |
|---|---|---|
| React 컴포넌트 파일 | PascalCase | `PostCard.tsx` |
| 훅 파일 | camelCase, `use` 접두사 | `useFetch.ts` |
| 서비스 파일 | camelCase, 도메인명 | `posts.ts` |
| 유틸 파일 | camelCase | `utils.ts` |
| 타입 파일 | camelCase | `index.ts` |
| 디렉토리 | camelCase (소문자) | `posts/`, `components/` |

### 변수 & 함수

| 대상 | 규칙 | 예시 |
|---|---|---|
| 변수, 함수 | camelCase | `getUserById`, `isLoading` |
| React 컴포넌트 | PascalCase | `PostCard`, `Button` |
| 타입 / 인터페이스 | PascalCase | `Post`, `ApiError` |
| 상수 (불변 원시값) | SCREAMING_SNAKE_CASE | `MAX_RETRY_COUNT` |
| boolean 변수 | `is`, `has`, `can` 접두사 | `isLoading`, `hasError` |
| 이벤트 핸들러 | `handle` 접두사 | `handleSubmit`, `handleClick` |
| 이벤트 Props | `on` 접두사 | `onClick`, `onSubmit` |

---

## 컴포넌트 작성 규칙

### 기본 형식

```tsx
// ✅ 올바른 형식
interface PostCardProps {
  post: Post;
  onSelect?: (id: number) => void;
}

export function PostCard({ post, onSelect }: PostCardProps) {
  return (/* JSX */);
}
```

```tsx
// ❌ 잘못된 형식 — default export + 인라인 타입
export default function ({ post }: { post: any }) {
  return (/* JSX */);
}
```

### 규칙

1. **Named export 사용** — `default export`는 Next.js 페이지(`app/` 내 파일)에서만 허용
2. **함수형 컴포넌트만 사용** — 클래스 컴포넌트 금지
3. **Props 인터페이스는 컴포넌트 바로 위에** 선언
4. **`any` 타입 금지** — 타입을 알 수 없을 때는 `unknown` 사용 후 타입 가드 적용
5. **`forwardRef`가 필요한 경우** `displayName` 반드시 설정

### Server / Client Component 구분

```tsx
// Client Component가 필요한 경우에만 최상단에 선언
'use client';
```

- `useState`, `useEffect`, 이벤트 핸들러가 있으면 → `'use client'`
- 데이터 fetch만 하면 → Server Component (기본값)
- 원칙: **가능한 한 Server Component 유지**, Client boundary를 최대한 아래로 내림

---

## 타입 규칙

```ts
// ✅ 구체적인 타입
interface ApiError {
  message: string;
  status: number;
}

// ❌ any 금지
const data: any = response.json();

// ✅ 모르는 타입은 unknown → 좁히기
const data: unknown = response.json();
if (typeof data === 'object' && data !== null && 'message' in data) { ... }
```

- 공유 타입 → `src/types/index.ts`
- 컴포넌트 내부 전용 타입 → 해당 파일 내 `interface`
- API 응답 타입에는 반드시 `ApiResponse<T>` 래퍼 또는 직접 타입 명시

---

## 환경 변수

```ts
// ❌ 직접 접근 금지
const url = process.env.NEXT_PUBLIC_API_BASE_URL;

// ✅ lib/env.ts 경유 필수
import { env } from '@/lib/env';
const url = env.apiBaseUrl;
```

새 환경 변수 추가 시:
1. `.env.local`에 변수 추가
2. `src/lib/env.ts`에 타입 안전하게 등록
3. `.env.local` 변수명은 PR 설명에 명시 (팀원이 로컬에서 설정할 수 있도록)

---

## Import 순서

Prettier + ESLint가 자동 정렬합니다. 수동으로 맞출 필요 없습니다.
순서 기준: Node built-ins → 외부 패키지 → 내부 `@/` 경로 → 상대 경로

---

## CSS / Tailwind 규칙

1. **인라인 `style` 속성 사용 금지** — 모든 스타일은 Tailwind 클래스로
2. **클래스 순서** — `prettier-plugin-tailwindcss`가 자동 정렬
3. **동적 클래스 조합** — `cn()` 유틸 사용 (`src/lib/utils.ts`)

```tsx
// ✅
<div className={cn('rounded-lg p-4', isActive && 'bg-blue-100')} />

// ❌ 문자열 직접 조합
<div className={`rounded-lg p-4 ${isActive ? 'bg-blue-100' : ''}`} />
```

4. **매직 숫자 금지** — Tailwind 척도(4, 8, 12...) 외의 값은 `src/styles/variables.css`에 CSS 변수로 정의

---

## 로깅

```ts
// ❌ 디버깅 console.log 커밋 금지 (ESLint warn)
console.log('data:', data);

// ✅ 경고/오류만 허용
console.warn('useFetch: 재시도 한도 초과');
console.error('API 오류:', error);
```

프로덕션 로깅 시스템이 추가되면 이 섹션을 업데이트하세요.
