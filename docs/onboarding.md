# 온보딩 가이드

> 팀에 합류한 사람(또는 에이전트)이 첫날 읽어야 할 문서입니다.
> 이 문서를 읽으면 독립적으로 작업을 시작할 수 있어야 합니다.

---

## 1. 로컬 환경 세팅 (15분)

### 요구사항
- Node.js 20.x 이상
- npm 10.x 이상 (또는 pnpm/yarn)

### 단계별 설정

```bash
# 1. 저장소 클론
git clone <repo-url>
cd SSAC_FRONTEND

# 2. 의존성 설치
npm install

# 3. 환경 변수 설정
cp .env.local.example .env.local
# .env.local 파일을 열어 팀 채널에서 받은 값으로 채우기
# (현재는 기본값으로도 동작: JSONPlaceholder API 사용)

# 4. 개발 서버 실행
npm run dev
# → http://localhost:3000 접속 확인
```

### 확인 사항
- [ ] http://localhost:3000 홈 화면이 보인다
- [ ] http://localhost:3000/posts 에서 포스트 목록이 로드된다
- [ ] `npm run build`가 오류 없이 완료된다
- [ ] `npm run lint`가 오류 없이 완료된다

---

## 2. 프로젝트 구조 이해 (10분)

```
SSAC_FRONTEND/
├── AGENTS.md           ← 에이전트/팀원 모두의 진입점. 반드시 읽기
├── docs/               ← 팀의 단일 진실 공급원
│   ├── architecture.md ← 레이어 구조와 의존성 규칙 (가장 중요)
│   ├── conventions.md  ← 네이밍, 파일 위치, 코드 형식
│   ├── quality.md      ← 현재 기술 부채 목록
│   └── decisions/      ← 과거 아키텍처 결정 기록 (ADR)
├── src/
│   ├── app/            ← Next.js 페이지 (라우팅만)
│   ├── features/       ← 도메인별 UI 기능 모듈
│   ├── components/     ← 재사용 공통 컴포넌트
│   ├── hooks/          ← 공통 커스텀 훅
│   ├── services/       ← API 통신 로직
│   ├── lib/            ← 유틸, 환경 변수
│   └── types/          ← 공유 타입 정의
└── .github/
    └── pull_request_template.md
```

**핵심 규칙 하나만 기억한다면:**
> `app/` 은 `services/` 를 직접 import하지 않습니다. 반드시 `features/` 를 경유합니다.

자세한 규칙은 [`docs/architecture.md`](architecture.md) 참고.

---

## 3. 첫 작업 시작 방법

### 새 기능 추가 흐름

```
1. 타입 정의    → src/types/index.ts
2. 서비스 생성  → src/services/<domain>.ts
3. 훅 생성     → src/features/<domain>/use<Domain>.ts (도메인 전용)
                  또는 src/hooks/use<Name>.ts (공통)
4. UI 컴포넌트 → src/features/<domain>/<Component>.tsx
5. 페이지 연결 → src/app/<route>/page.tsx
```

### 브랜치 전략

```
main          ← 항상 배포 가능한 상태
  └── feat/<ticket-number>-<short-description>
  └── fix/<ticket-number>-<short-description>
  └── chore/<description>
```

- `main`에 직접 커밋 금지
- 작업 단위: 하나의 기능 또는 버그 수정
- PR 전 반드시 `npm run build && npm run lint` 통과

---

## 4. 팀 협업 규칙

### PR 규칙
- PR 템플릿(`.github/pull_request_template.md`)을 반드시 작성
- 최소 1명의 팀원 리뷰 승인 후 머지
- CI 체크 통과 필수

### 문서 업데이트 책임
- 코드를 변경할 때 관련 `docs/` 파일도 함께 수정
- 새 아키텍처 결정은 `docs/decisions/`에 ADR 추가
- 에이전트가 실수를 반복하면 `docs/decisions/mistake-log-*.md` 작성

### 커뮤니케이션
- 기술 결정은 구두/슬랙이 아닌 `docs/decisions/`에 기록
- 기술 부채 발견 시 `docs/quality.md`에 즉시 등록

---

## 5. 자주 묻는 질문

**Q: 새 npm 패키지를 추가해도 되나요?**
A: 팀 논의 후 `docs/decisions/`에 ADR을 작성하고 추가하세요. 임의 추가 금지.

**Q: 환경 변수를 어디서 관리하나요?**
A: `src/lib/env.ts`에 등록, `.env.local`에 값 설정. `process.env` 직접 접근 금지.

**Q: 컴포넌트를 `components/`에 둘지 `features/`에 둘지 모르겠어요.**
A: "다른 도메인에서도 쓰일 수 있는가?" → `components/ui/`. "이 도메인에서만 쓰이는가?" → `features/<domain>/`.

**Q: 테스트는 어떻게 작성하나요?**
A: 현재 테스트 프레임워크가 없습니다. `docs/quality.md` TD-001 참고. 도입 전까지는 타입스크립트 타입으로 최대한 검증하세요.
