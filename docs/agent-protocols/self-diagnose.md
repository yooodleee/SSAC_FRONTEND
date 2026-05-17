# 프로토콜: 자가 진단 & 하네스 강화

> 오류 분류·자동 수정(STEP 1~3)과 반복 오류 패턴 감지·하네스 강화(STEP 4~5)를 담당합니다.
> STEP 실행 범위는 트리거 조건에 따라 달라집니다.

---

## 트리거 조건

### STEP 1~3만 실행 (경량 진단 — 자동)

- 구현 완료 직후
- 에러 또는 예외 상황 발생 시 (최초 1회)
- 사용자가 "확인해줘", "점검해줘" 요청 시

### STEP 1~5 전체 실행 (하네스 강화 — 자동)

- `npm run lint` 또는 `npm run build`가 동일 오류로 **2회 이상** 실패
- CI가 같은 규칙 위반으로 **2회 이상** PR을 차단

---

## 진단 단계

### STEP 1 — 오류 분류

오류 메시지를 읽고 아래 표에서 유형을 찾습니다:

| 오류 패턴                            | 유형                   | 이동할 단계 |
| ------------------------------------ | ---------------------- | ----------- |
| `@typescript-eslint/no-explicit-any` | 타입 위반              | STEP 2-A    |
| `[레이어 위반]` 포함                 | 아키텍처 위반          | STEP 2-B    |
| `no-unused-vars`                     | 코드 노이즈            | STEP 2-C    |
| `Cannot find module`                 | import 경로 오류       | STEP 2-D    |
| `Type error:`                        | TypeScript 컴파일 오류 | STEP 2-E    |
| 위 패턴 없음                         | 미분류 오류            | STEP 3      |

---

### STEP 2-A — 타입 위반 자가 수정

```
1. any가 사용된 파일:라인 찾기
2. 해당 값의 실제 형태 파악:
   - API 응답 타입이면 → api-contract/generated/api-types.ts 확인 후 import (AGENTS.md 규칙 우선)
   - UI 전용 타입이면 → src/types/index.ts 확인
3. 정확한 타입이 있으면 → 교체
4. 외부 라이브러리 반환값이면 → 해당 라이브러리 타입 import
5. 진짜 알 수 없으면 → unknown + 타입 가드로 좁히기

수정 후: npx tsc --noEmit 재실행
```

---

### STEP 2-B — 아키텍처 위반 자가 수정

```
1. 오류 메시지의 [레이어 위반] 설명 읽기
2. docs/architecture.md 의 레이어 매트릭스 확인
3. 허용된 경로로 재설계:
   - app → services 직접: features/ 컴포넌트 경유로 변경
   - components → services: props로 데이터 수신하도록 변경
4. import 수정 후: npm run lint 재실행
```

---

### STEP 2-C — 미사용 변수 자가 수정

```
1. 실제로 사용 예정인가?
   YES → 사용하는 코드 완성
   NO  → 변수/import 삭제
2. 의도적으로 무시해야 하는 함수 파라미터?
   YES → _접두사 추가 (예: _event)
```

---

### STEP 2-D — import 경로 오류 자가 수정

```
1. 파일이 실제로 존재하는지 확인
2. @/* 절대경로 사용 여부 확인 (상대경로 ../../../ 사용 금지)
3. Named export인지 확인 (default export와 혼용 주의)
4. tsconfig.json 의 paths 설정 확인: "@/*": ["./src/*"]
```

---

### STEP 2-E — TypeScript 컴파일 오류 자가 수정

```
1. 오류 메시지의 파일:라인 이동
2. 오류 유형 파악:
   - "Property does not exist" → 타입 정의 확인/업데이트
   - "Argument of type X is not assignable to Y" → 타입 좁히기 또는 타입 가드
   - "Object is possibly undefined" → optional chaining 또는 null check 추가
3. 타입 추가가 필요한 경우 — AGENTS.md 타입 정의 위치 규칙 준수:
   - API 요청/응답 타입 → api-contract/generated/api-types.ts 에서 import (수동 작성 금지)
   - API 타입이 api-types.ts에 없음 → 작업 중단 후 BE 팀에 Contract 추가 요청
   - UI 전용 타입 → src/types/index.ts 에 추가 허용 (단, // UI-only type 주석 필수)
```

---

### STEP 3 — 미분류 오류 처리

```
1. 오류 메시지 전체를 기록
2. 발생 파일과 컨텍스트 기록
3. 시도한 수정 내역 기록
4. docs/decisions/ 에 mistake-log 생성 (아래 STEP 4)
5. PR 설명에 "미해결 오류" 섹션으로 명시
```

---

### STEP 4 — 반복 오류 시 하네스 강화 기록 〔2회 이상 반복 시만 실행〕

동일 오류가 2회 이상 반복됐다면 `docs/decisions/mistake-log-<NNN>.md` 를 생성합니다:

```bash
# 다음 번호 확인
ls docs/decisions/mistake-log-*.md 2>/dev/null | wc -l
# 없으면 001부터 시작
```

파일 내용 — 아래 항목을 채워서 저장:

```markdown
# ML-NNN: [오류 제목]

| 항목      | 내용       |
| --------- | ---------- |
| 날짜      | YYYY-MM-DD |
| 반복 횟수 | N회        |

## 오류 내용

[오류 메시지 전문]

## 근본 원인

[왜 이 오류가 발생했는가]

## 하네스에 추가된 해결책

- [ ] eslint.config.mjs 규칙 추가
- [ ] AGENTS.md 금지 목록 업데이트
- [ ] docs/architecture.md 경고 추가
- [ ] docs/agent-protocols/ 새 프로토콜 작성

## 검증

[수정 후 실행한 명령어와 결과]
```

---

### STEP 5 — 하네스 업데이트 체크 〔2회 이상 반복 시만 실행〕

mistake-log 작성 후 아래를 검토합니다:

```
Q: 이 오류를 ESLint 규칙으로 사전 차단할 수 있는가?
  YES → eslint.config.mjs 에 규칙 추가 (remediation 메시지 포함)

Q: 이 오류가 문서 누락에서 비롯됐는가?
  YES → 해당 docs/ 파일 업데이트

Q: 이 오류가 AGENTS.md 의 프로토콜 누락에서 비롯됐는가?
  YES → AGENTS.md 의사결정 트리 또는 금지 목록 업데이트
```

하네스를 업데이트하면 동일 오류는 다음 에이전트 세션에서 사전 차단됩니다.
