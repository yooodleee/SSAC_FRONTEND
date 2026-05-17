# Contract 동기화 하네스 (FE)

## 트리거 조건 (자동 실행)

- BE 팀으로부터 API 변경 알림을 받았을 때
- `api-contract/swagger.json` 또는 `error-contract.yml`이 변경되었을 때
- `npm run sync:api` 실행 직후
- 사용자가 "contract", "API 변경", "swagger", "동기화" 언급 시

---

## STEP 1. Contract 동기화 실행

```bash
npm run sync:api
```

→ `api-contract/swagger.json` 갱신
→ `api-contract/generated/api-types.ts` 자동 재생성
→ `api-contract/CHANGELOG.md` 엔드포인트 diff 자동 기록

실행 결과 확인:

```
□ "✅ API 동기화 완료" 메시지인가?
   → 변경 없음: STEP 2~5 스킵, 완료

□ "⚠️ API가 변경되었습니다" 메시지인가?
   → STEP 2로 이동
```

---

## STEP 2. 변경 내역 파악

`api-contract/CHANGELOG.md` 최신 항목을 읽어 변경 유형을 분류한다.

```
[변경 내역 분류]
➕ 추가된 엔드포인트 : N개
   - METHOD /api/v1/...

➖ 제거된 엔드포인트 : N개
   - METHOD /api/v1/...

⚠️ 경로 변경 (제거 + 추가 동시) : N개
   - 이전: METHOD /api/v1/old-path
   - 이후: METHOD /api/v1/new-path
```

---

## STEP 3. 영향 범위 분석

STEP 2에서 분류된 변경 엔드포인트를 기준으로 영향받는 FE 파일을 탐색한다.

### 3-1. BFF route 파일 탐색

```bash
# 변경된 경로 키워드로 BFF route 파일 검색
grep -rn "{변경된 경로 키워드}" src/app/api/ --include="*.ts" -l
```

### 3-2. 서비스 / 훅 파일 탐색

```bash
grep -rn "{변경된 경로 키워드}" src/services/ src/hooks/ --include="*.ts" -l
```

### 3-3. api-types.ts import 파일 탐색

```bash
grep -rn "from.*api-contract\|from.*api-types" src/ --include="*.ts" --include="*.tsx" -l
```

탐색 완료 후 출력:

```
[영향 범위 분석 결과]
BFF route 파일 : N개
- src/app/api/v1/.../route.ts

서비스 / 훅 파일 : N개
- src/services/xxx.ts
- src/hooks/useXxx.ts

컴포넌트 파일 : N개
- src/features/.../XxxComponent.tsx
```

---

## STEP 4. 변경 유형별 대응

### ➕ 엔드포인트 추가

```
□ 해당 엔드포인트를 호출하는 BFF route.ts가 필요한가?
   → 필요: src/app/api/v1/{경로}/route.ts 신규 생성 (new-feature.md 실행)
   → 불필요: 스킵

□ 신규 API 타입이 api-types.ts에 정상 생성되었는가?
   → 확인: api-contract/generated/api-types.ts에서 신규 타입 검색
```

### ➖ 엔드포인트 제거

```
□ STEP 3에서 발견된 영향 파일 목록을 출력한다
□ 각 파일에서 해당 엔드포인트 호출 코드를 제거 또는 대체 경로로 수정한다
□ 사용자에게 수정 방향 확인 후 진행한다
```

> 제거된 엔드포인트를 호출하는 코드를 확인 없이 임의로 삭제하는 것은 금지된다.

### ⚠️ 경로 변경 (breaking change)

```
□ 이전 경로를 호출하는 모든 파일을 새 경로로 수정한다
□ BFF route.ts: 프록시 대상 경로 업데이트
□ 서비스 / 훅: API 호출 경로 업데이트
□ 수정 후 STEP 5 검증 실행
```

---

## STEP 5. ErrorCode 동기화

`error-contract.yml`이 변경된 경우에만 실행한다.

```bash
npm run validate:error-mapping
```

```
□ 검증 통과: 완료
□ 검증 실패 — 누락된 ErrorCode 존재:
   → src/constants/errorMessages.ts에 누락 항목 추가
   → 추가 형식: 'CODE-000': '사용자에게 노출할 메시지'
   → 재실행: npm run validate:error-mapping → 통과 확인
```

---

## STEP 6. 타입 검증

```bash
npm run typecheck
```

```
□ 타입 오류 0개: 완료
□ 타입 오류 발생:
```

오류 발생 시 출력 형식:

```
[타입 오류 발생]
- 오류 파일 : src/features/xxx/XxxComponent.tsx:42
- 오류 내용 : Property 'fieldName' does not exist on type '...'
- 원인      : api-types.ts에서 해당 필드가 제거 또는 이름 변경됨
- 수정 방향 : CHANGELOG.md 확인 후 새 필드명으로 교체

→ 수정 완료 후 npm run typecheck 재실행
```

> 타입 오류 수정 시 추측 기반 수정 금지 — 반드시 CHANGELOG.md와 api-types.ts를 먼저 확인한다.

---

## 완료 출력

```
[Contract 동기화 완료]
- 추가된 엔드포인트 : N개
- 제거된 엔드포인트 : N개 → 영향 파일 N개 수정
- ErrorCode 추가    : N개
- 타입 오류         : 0개
→ 동기화 완료. 변경된 파일을 PR에 포함한다.
```
