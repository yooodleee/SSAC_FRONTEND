# SSAC Frontend

Production-ready Next.js 15 스타터 템플릿

## 기술 스택

| 기술         | 버전         | 용도                    |
| ------------ | ------------ | ----------------------- |
| Next.js      | 15.x         | 프레임워크 (App Router) |
| React        | 19.x         | UI 라이브러리           |
| TypeScript   | 5.x (strict) | 타입 안전성             |
| Tailwind CSS | 4.x          | 스타일링                |
| ESLint       | 9.x          | 코드 품질               |
| Prettier     | 3.x          | 코드 포맷팅             |

## 프로젝트 구조

```
src/
├── app/                  # Next.js App Router (페이지, 레이아웃)
│   ├── layout.tsx        # 루트 레이아웃
│   ├── page.tsx          # 홈 페이지
│   ├── not-found.tsx     # 404 페이지
│   ├── globals.css       # 전역 스타일
│   └── posts/
│       └── page.tsx      # 포스트 목록 페이지
├── components/           # 재사용 공통 컴포넌트
│   ├── layout/           # Header, Footer
│   └── ui/               # Button, Card 등 원자 단위 컴포넌트
├── features/             # 도메인별 기능 모듈
│   └── posts/
├── hooks/                # 공통 커스텀 훅
│   ├── useFetch.ts
│   └── useLocalStorage.ts
├── lib/                  # 유틸리티, 환경 변수 접근
│   ├── utils.ts
│   └── env.ts
├── services/             # API 통신 로직
│   ├── api.ts            # fetch 래퍼
│   └── posts.ts
├── styles/               # 디자인 토큰, 전역 CSS 변수
│   └── variables.css
└── types/                # 공통 TypeScript 타입 정의
    └── index.ts
```

## 배포 정보

| 환경          | 플랫폼  | URL                                           |
| ------------- | ------- | --------------------------------------------- |
| FE Production | Vercel  | https://ssac-frontend.vercel.app              |
| BE Production | Railway | https://ssacbackend-production.up.railway.app |

## 로컬 개발 환경 실행

### 1. 저장소 클론

```bash
git clone https://github.com/SSACLAB/SSAC_FRONTEND
```

### 2. 의존성 설치

```bash
npm ci
```

### 3. 환경 변수 설정

```bash
cp .env.example .env.local
# .env.local 파일에 값 입력
```

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 을 열어 확인하세요.

### 5. 빌드 & 프로덕션 실행

```bash
npm run build
npm run start
```

### 6. 코드 품질 도구

```bash
# ESLint 검사
npm run lint

# Prettier 포맷팅
npm run format
```

## 주요 설계 원칙

- **Feature-based 구조**: 도메인 기능별로 코드를 모아 응집도 향상
- **Services 레이어**: API 호출을 컴포넌트에서 분리, 교체 용이
- **Strict TypeScript**: `any` 타입 금지, 런타임 오류 최소화
- **환경 변수 중앙화**: `src/lib/env.ts` 한 곳에서 관리하여 누락 시 즉시 오류 발생
- **커스텀 훅 분리**: 비즈니스 로직을 컴포넌트 외부로 추출

## API 예제 추가 방법

1. `src/types/index.ts`에 타입 추가
2. `src/services/`에 서비스 파일 생성
3. `src/features/`에 기능 컴포넌트 생성
4. `src/app/`에 페이지 파일 추가
