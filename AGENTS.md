# AGENTS.md — 환경 진입점

> 규칙은 이 파일에 없습니다. 도구가 강제합니다.
> 이 파일은 "어떤 도구를 사용해 무엇을 하는가"만 안내합니다.
> 프로세스 하네스(SC 점검 등)는 `CLAUDE.md`를 참조하세요.

---

## 이 프로젝트

SSAC_FRONTEND — Next.js 15 + TypeScript strict + Tailwind CSS v4.
인간은 의도를 정의하고, 에이전트가 아래 환경 도구로 구현합니다.

---

## 환경 도구 지도

| 목적                       | 명령                                  | 기계적 진실 위치          |
| -------------------------- | ------------------------------------- | ------------------------- |
| 전체 검증 (단일 진입점)    | `npm run validate`                    | `package.json`            |
| 타입 검사                  | `npm run typecheck`                   | `tsconfig.json`           |
| 코드 품질 + 레이어(ESLint) | `npm run lint`                        | `eslint.config.mjs`       |
| 레이어 아키텍처 검사       | `npm run layers`                      | `.dependency-cruiser.cjs` |
| 포맷 적용                  | `npm run format`                      | `.prettierrc`             |
| 새 도메인 스캐폴딩         | `npm run scaffold -- --domain=<name>` | `scripts/scaffold.js`     |

**커밋 전 자동 실행**: `.githooks/pre-commit` → `npm run validate`
활성화: `npm install` (prepare 스크립트가 git hooks 경로 설정)

---

## 태스크 시작 시

```bash
npm run validate        # 현재 환경 상태 확인 (baseline)
```

오류가 있으면 내 변경 전에 먼저 수정하거나, 기존 오류임을 기록합니다.

---

## 새 기능 추가 시

```bash
# 환경이 구조를 생성합니다. 파일 위치를 고민하지 마세요.
npm run scaffold -- --domain=<name> --endpoint=/<path>

# 생성된 파일에서 TODO 를 채우고:
npm run validate        # 모두 통과해야 커밋 가능
```

---

## 판단이 필요할 때

| 질문                           | 도구/파일                                                  |
| ------------------------------ | ---------------------------------------------------------- |
| "이 import가 허용되는가?"      | `npm run layers` 실행 → 즉시 오류 출력                     |
| "이 타입이 올바른가?"          | `npm run typecheck` 실행                                   |
| "왜 이 구조인가?"              | `docs/architecture.md` (`.dependency-cruiser.cjs` 의 설명) |
| "새 패키지를 추가해도 되는가?" | `docs/agent-protocols/adr-create.md` 실행                  |
| "CI가 계속 실패한다"           | `docs/agent-protocols/self-diagnose.md` 실행               |

---

## API 계약 규칙

> API 타입은 **자동 생성된 단일 소스**에서만 가져옵니다.
> 수동 타입 작성 및 스펙 외 엔드포인트 호출은 금지입니다.

### 작업 시작 전 체크

```bash
# api-contract/swagger.json 최종 수정 시각 확인
stat -c '%y' api-contract/swagger.json   # Linux/macOS
```

**24시간 이상 지났다면** API를 먼저 동기화한 후 작업을 시작하세요:

```bash
npm run sync:api
```

동기화 후 `⚠️ API가 변경되었습니다.` 메시지가 출력되면
`api-contract/CHANGELOG.md`를 열어 변경된 엔드포인트를 확인하고
영향받는 컴포넌트를 점검한 뒤 작업을 진행하세요.

---

### API 코드 작성 규칙

| 규칙                        | 설명                                                                           |
| --------------------------- | ------------------------------------------------------------------------------ |
| **타입 import 경로**        | `api-contract/generated/api-types.ts` 에서만 import                            |
| **수동 타입 작성 금지**     | API 응답 타입을 직접 `interface` / `type`으로 정의하지 않는다                  |
| **스펙 외 엔드포인트 금지** | `swagger.json`의 `paths`에 없는 엔드포인트 호출 코드 작성 금지                 |
| **불일치 시 행동**          | 실제 동작과 Swagger가 다를 경우 임의 수정 금지 — 백엔드 팀에 이슈 제기 후 대기 |

```ts
// ✅ 올바른 import
import type { paths, components } from '@/api-contract/generated/api-types';

// ❌ 금지: 수동 타입 작성
interface UserResponse {
  id: number;
  name: string;
}
```

---

### Breaking Change 감지 시 행동 순서

1. `npm run sync:api` 를 실행해 최신 스펙을 받아온다.
2. `api-contract/CHANGELOG.md` 에서 제거·변경된 엔드포인트를 확인한다.
3. 영향받는 파일을 `grep -r "제거된_엔드포인트" src/` 로 찾는다.
4. 타입 오류를 `npm run typecheck` 로 전부 확인한다.
5. 수정이 완료되면 `npm run validate` 로 전체 검증 후 커밋한다.
6. 백엔드 팀과 합의 없이 API 경로·파라미터를 임의 변경하지 않는다.

---

### 동기화 실패 시

```bash
# SWAGGER_URL 환경변수가 필요합니다
export SWAGGER_URL=https://api.example.com/api-docs/swagger.json
npm run sync:api
```

- `❌ Swagger 다운로드 실패` → 백엔드 서버 상태 또는 URL을 확인하세요.
- `❌ 유효한 JSON이 아닙니다` → 백엔드 팀에 Swagger 엔드포인트 상태를 문의하세요.
- CI에서 `SWAGGER_URL` secret이 없으면 워크플로우가 실패합니다 — 저장소 Settings > Secrets에서 확인하세요.
