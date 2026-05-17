# CLAUDE.md — 프로세스 하네스

> 이 파일은 **Claude Code 전용** 프로세스 지침입니다.
> 환경 도구(lint · typecheck · scaffold 등)는 `AGENTS.md`를 참조하세요.
> 도구로 강제할 수 없는 **작업 절차 규칙**만 이 파일에 정의합니다.

---

## 🛡️ Agent Harness Protocols

| 프로토콜       | 파일 위치                                | 트리거 조건                              | 실행 방식                        |
| -------------- | ---------------------------------------- | ---------------------------------------- | -------------------------------- |
| 토큰 최적화    | docs/agent-protocols/token-optimize.md   | 작업 시작 전 / 스프린트 종료             | 자동 (작업 전) + 수동 (스프린트) |
| SC 관심사 점검 | docs/agent-protocols/sc-harness.md       | SC가 포함된 작업 지시를 받았을 때        | 자동 (구현 전 필수)              |
| SC 생성/수정   | docs/agent-protocols/backlog-generate.md | SC 포함 작업 지시 시                     | 자동 (sc-harness 직후)           |
| 신규 기능 개발 | docs/agent-protocols/new-feature.md      | 새로운 컴포넌트/페이지/기능 추가 요청 시 | 자동 (구현 전 필수)              |
| 테스트 작성    | docs/agent-protocols/testing.md          | 신규 컴포넌트/훅/API 연동 구현 완료 시   | 자동 (구현 후 필수)              |
| 하네스 감사    | docs/agent-protocols/harness-audit.md    | 하네스 점검 요청 시 / 주기적 실행        | 수동 또는 주기적                 |
| 자가 진단      | docs/agent-protocols/self-diagnose.md    | 에러 발생 / 구현 완료 후 검증 시         | 자동 (구현 후 필수)              |
| ADR 생성       | docs/agent-protocols/adr-create.md       | 기술적 의사결정이 발생했을 때            | 수동 (결정 시점)                 |
| 로그 기반 진단 | docs/agent-protocols/log-diagnose.md     | 오류 발생 즉시                           | 자동 (오류 즉시)                 |
| 디자인 시스템  | DESIGN.md                                | UI/UX 관련 작업 시                       | 자동 (구현 전 필수)              |

---

## 🔁 Protocol Trigger Rules

### ✅ 자동 실행 (에이전트가 반드시 실행해야 하는 프로토콜)

[sc-harness.md] 다음 키워드가 포함된 작업 지시를 받은 경우

- "SC", "Success Criteria", "성공 조건", "백로그"

[new-feature.md] 다음 요청을 받은 경우

- 새로운 페이지, 컴포넌트, API 연동, 기능 추가
- "만들어줘", "추가해줘", "구현해줘"

[testing.md] 다음 상황에서 실행

- 신규 컴포넌트, 페이지, 훅 구현 완료 시
- 신규 API 연동 코드 구현 완료 시
- 사용자가 "테스트 작성", "test", "검증" 언급 시
- quality.md TD-001 관련 작업 시

[self-diagnose.md] 다음 상황에서 실행

- 구현 완료 직후
- 에러 또는 예외 상황 발생 시
- 사용자가 "확인해줘", "점검해줘" 요청 시

[DESIGN.md] 다음 상황에서 실행

- 새로운 컴포넌트 / 페이지 생성 시
- 기존 UI 수정 시
- 사용자가 "디자인", "UI", "화면", "레이아웃" 언급 시

### 🖐️ 수동 실행 (사용자 요청 또는 특정 시점에 실행)

[harness-audit.md] 다음 상황에서 실행

- 사용자가 "하네스 점검", "감사", "audit" 요청 시
- 스프린트 종료 시점

[adr-create.md] 다음 상황에서 실행

- 기술 스택, 아키텍처, 설계 방식에 대한 의사결정이 발생했을 때
- 사용자가 "기록해줘", "ADR", "의사결정" 언급 시

---

## ⚡ 전체 Protocol Execution Order

[작업 시작 전]
0순위 token-optimize.md (STEP 1만) → 컨텍스트 최소화
1순위 sc-harness.md → SC 관심사 점검
2순위 backlog-generate.md → 프로젝트 구조 파악 / SC 생성·수정·충돌 점검
3순위 new-feature.md → 신규 기능 개발

[작업 완료 후]
3순위 testing.md → 테스트 작성
4순위 self-diagnose.md → 자가 점검

[오류 발생 시]
즉시 log-diagnose.md → 로그 기반 진단

[수동 실행]

- adr-create.md → 기술 의사결정
- harness-audit.md → 전체 감사
- token-optimize.md (STEP 1~4 전체) → 스프린트 종료 시 전체 최적화

> 1순위 프로토콜 실행 결과가 중단(STOP)인 경우 이후 프로토콜은 실행되지 않는다.

---

## ⚡ 오류 발생 시 Protocol Execution Order

1순위 log-diagnose.md → 로그 기반 원인 진단 (즉시, 추측 기반 수정 금지)
2순위 self-diagnose.md → 자가 점검
3순위 testing.md → 재발 방지 테스트 추가
4순위 adr-create.md → 반복 오류 3회 이상 시 의사결정 기록

---

## 🔍 Protocol Self-Check

작업 시작 전 에이전트는 반드시 아래 질문에 답해야 한다:

□ 이 작업에 SC가 포함되어 있는가?
→ YES : sc-harness.md 실행
□ 이 작업이 신규 기능 추가인가?
→ YES : new-feature.md 실행
□ 이 작업이 UI/UX 관련 작업인가?
→ YES : DESIGN.md 먼저 읽고 작업 시작
□ 이 작업에서 기술적 의사결정이 발생했는가?
→ YES : adr-create.md 실행
□ 신규 컴포넌트/훅/API 연동 구현이 완료되었는가?
→ YES : testing.md 실행
□ 구현이 완료되었는가?
→ YES : self-diagnose.md 실행

위 질문을 건너뛰고 바로 구현을 시작하는 것은 금지된다.

---

## ⚠️ Protocol Conflict Resolution Rule

프로토콜 간 규칙이 충돌하는 경우 아래 우선순위를 따른다:

1순위 AGENTS.md → API 계약 규칙 (절대 우선)
2순위 CLAUDE.md → 전역 하네스 규칙
3순위 new-feature.md → 기능 개발 프로토콜
4순위 기타 프로토콜

충돌이 감지된 경우:
→ 임의로 판단하지 말고 충돌 내용을 출력한 후 작업을 중단하라
→ 출력 형식:
⚠️ CONFLICT DETECTED

- 충돌 규칙 A : [파일명] 내용
- 충돌 규칙 B : [파일명] 내용
  → 우선순위 규칙에 따라 [A/B]를 따릅니다.
  → 낮은 우선순위 규칙([B/A])은 이번 작업에서 건너뜁니다.

---

## 💰 Token Economy Rules (전역 적용)

### 파일 로드 규칙

□ 작업과 무관한 파일은 로드하지 않는다
□ node_modules / .next / coverage 는 절대 로드하지 않는다
□ 프로토콜 파일은 트리거 조건 충족 시에만 로드한다

### 응답 생성 규칙

□ 컴포넌트 전체 코드 대신 변경된 부분만 출력한다
□ 이미 확인된 내용을 반복 출력하지 않는다
□ 체크리스트는 미통과 항목만 출력한다
□ 긴 예시 코드는 docs/examples/ 파일을 참조한다

### 프로토콜 실행 규칙

□ 트리거 조건을 충족하지 않는 프로토콜은 실행하지 않는다
□ 이미 통과한 프로토콜을 동일 작업에서 재실행하지 않는다
□ 프로토콜 실행 결과는 요약본만 출력한다
예) "sc-harness.md 통과 — FE SC 5개 확인" (상세 내용 생략)

### 자가 진단 주기

□ 매 작업 시작 전 : token-optimize.md STEP 1 (컨텍스트 최소화)만 실행
□ 매 스프린트 종료 시 : token-optimize.md STEP 1~4 전체 실행
□ 프로토콜 파일이 200줄 초과 시 즉시 분리
□ 미사용 파일 감사는 월 1회 수동 실행

---

## 🚫 진단 없는 수정 금지 규칙

오류 발생 시 아래 행동은 금지된다:

- log-diagnose.md 실행 없이 코드 수정 시작
- 원인 불명 상태에서 추측 기반 수정
- 500 Server Error를 FE에서 임의로 수정 시도
- X-Trace-Id 없이 BE 연관 오류를 FE에서 해결 시도

---

## 🚫 SC 검토 없이 구현 금지 규칙

아래 행동은 금지된다:

- 외부에서 제공된 SC를 검토 없이 그대로 구현
- 프로젝트 구조 파악 없이 SC 생성
- DESIGN.md 확인 없이 UI 컴포넌트 구현
- api-types.ts 확인 없이 타입 수동 정의
- errorMessages.ts 확인 없이 ErrorCode 처리 추가
- backlog-generate.md 실행 없이 new-feature.md 실행

---

## 하네스 목록 (레거시 — 하위 호환용)

| 하네스                        | 트리거 조건                       | 위치                                     |
| ----------------------------- | --------------------------------- | ---------------------------------------- |
| 토큰 최적화                   | 작업 시작 전 / 스프린트 종료      | docs/agent-protocols/token-optimize.md   |
| SC 관심사 점검 및 자동 재작성 | 작업 지시에 SC 항목이 포함된 경우 | docs/agent-protocols/sc-harness.md       |
| SC 생성/수정                  | SC 포함 작업 지시 시              | docs/agent-protocols/backlog-generate.md |
| 로그 기반 진단                | 오류 발생 즉시                    | docs/agent-protocols/log-diagnose.md     |

---

## ▲ Vercel 배포 실패 시 자동 진단 규칙

트리거 조건:

- "Vercel 배포 실패", "빌드 실패", "배포 안 됨" 언급 시
- Vercel 대시보드에서 Error 상태 확인 시

자동 실행 절차:

1. `vercel ls`로 최신 배포 URL 확인
2. `vercel logs <url>`로 빌드 로그 수집 (또는 `npm run logs:vercel`)
3. log-diagnose.md Vercel 섹션 분류표 기준으로 원인 분류
4. 로컬 `npm run build`로 동일 오류 재현 확인
5. 원인 확정 후 수정 진행
6. 수정 완료 후 `npm run logs:vercel:live`로 재배포 확인

금지 규칙:

- 로그 확인 없이 추측 기반으로 코드 수정 금지
- 사용자가 로그를 직접 복사하여 제공하도록 요청 금지
- 로컬 빌드 성공 확인 없이 push 금지

---

## 🚀 배포 전 필수 절차

main 브랜치에 push 전 반드시 아래 절차를 수행한다:

1. `npm run pre-deploy` 실행
   → TypeScript / ESLint / 빌드 모두 통과 확인

2. 모두 통과한 경우에만 push 진행

   ```bash
   git push origin main
   ```

3. 배포 실패 시 즉시 실행:
   ```bash
   npm run logs:vercel
   ```
   → 로그 확인 후 log-diagnose.md 프로토콜 실행

---

## 📐 디자인 작업 규칙

UI/UX 관련 작업 트리거 조건:

- 새로운 컴포넌트 / 페이지 생성 시
- 기존 UI 수정 시
- 사용자가 "디자인", "UI", "화면", "레이아웃" 언급 시

→ 위 조건 해당 시 DESIGN.md를 반드시 먼저 읽고 작업 시작
→ DESIGN.md 에이전트 준수 규칙의 체크리스트를 작업 완료 후 검증
→ DESIGN.md에 정의되지 않은 디자인 결정은 임의로 하지 않고 사용자에게 확인 후 DESIGN.md에 추가
