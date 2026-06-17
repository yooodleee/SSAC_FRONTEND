# PR 생성 전 체크리스트 (FE)

## 트리거 조건 (수동 — PR 생성 직전)

- main 브랜치 push 전
- PR 생성 직전
- 사용자가 "PR", "푸시", "배포" 언급 시

> `npm run pre-deploy` (TypeScript / ESLint / 빌드) 는 이 체크리스트 완료 후 실행한다.

---

## STEP 1. SC 달성 확인

작업 지시에서 확정된 최종 SC 목록을 기준으로 각 항목을 체크한다.

```
□ SC 항목 1 달성 여부 확인
□ SC 항목 2 달성 여부 확인
...
```

출력 형식:

```
[SC 달성 확인]
✅ (SC 항목) — 달성
❌ (SC 항목) — 미달성 → PR 생성 중단, 구현 보완 후 재확인
```

> ❌ 미달성 항목이 1개 이상인 경우 STEP 2 이후를 진행하지 않는다.

---

## STEP 2. 코드 품질 체크

변경된 파일을 대상으로 아래 항목을 확인한다.

### 2-1. 디버그 코드 잔존 여부

```bash
# 변경 파일 내 console 구문 검색
git diff --name-only HEAD | xargs grep -l "console\." 2>/dev/null
```

```
□ console.log / console.error / console.warn 잔존 없음
□ debugger 구문 잔존 없음
```

### 2-2. 주석 처리된 코드 블록

```
□ 10줄 이상 주석 처리된 코드 블록 없음
   → 삭제하거나 TODO 사유를 명시한 경우는 허용
```

### 2-3. 방치된 TODO / FIXME

```
□ 이번 작업과 관련된 TODO / FIXME 가 모두 해소되었는가
   → 해소 불가한 경우 : quality.md 기술 부채 항목에 등록 후 허용
```

출력 형식:

```
[코드 품질 체크]
✅ console 구문 없음
⚠️ TODO 1건 — src/hooks/useAuth.ts:42 (quality.md 등록 후 허용)
```

---

## STEP 3. DESIGN.md 준수 재확인

UI 파일이 변경된 경우에만 실행한다.

```
□ 임의 색상 하드코딩 없음 (DESIGN.md 컬러 토큰 사용)
□ 인터랙티브 요소(버튼, 링크 등) 터치 영역 48px 이상
□ 로딩 / 빈 상태 / 에러 상태 모두 구현됨
□ 타이포그래피 스케일 준수 (임의 font-size 하드코딩 없음)
```

UI 변경 없는 경우:

```
→ "UI 변경 없음 — STEP 3 스킵"
```

---

## STEP 4. 테스트 파일 확인

```
□ 신규 생성한 컴포넌트 / 훅에 대응하는 테스트 파일이 존재하는가
   → 존재: ✅
   → 미존재 + testing.md BLOCKED(TD-001): ⚠️ 기술 부채 등록 후 허용
   → 미존재 + testing.md 해제 상태: ❌ PR 생성 중단
□ 기존 테스트가 변경으로 인해 깨지지 않는가 (Jest 설치 후 확인)
□ 커버리지 기준(컴포넌트 70% / 훅 80% / 유틸 90%)을 충족하는가
   → npm run test:coverage 로 확인
□ jest.config.mjs coverageThreshold에 해당 파일이 등록되어 있는가
   → 미등록 시 testing.md "coverageThreshold 등록 규칙" 따라 추가
```

---

## STEP 5. 빌드 확인

```bash
npm run pre-deploy
```

```
□ TypeScript 타입 오류 0개
□ ESLint 오류 0개
□ 빌드 성공
```

> 실패 시 : log-diagnose.md 실행 → 원인 확정 후 수정 → 재실행

---

## 최종 판단

```
if (❌ 항목이 1개 이상):
  → PR 생성 중단
  → 미달성 항목 목록 출력 후 보완

if (⚠️ 항목만 존재):
  → 내용 출력 후 PR 생성 진행
  → PR 본문 "주의 사항" 섹션에 ⚠️ 항목 명시

if (모든 항목 ✅ 또는 허용된 ⚠️):
  → "PR 체크리스트 통과. PR을 생성합니다."
```
