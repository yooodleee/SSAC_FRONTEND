# Log Diagnosis — Vercel 배포 실패 프로토콜

> 이 파일은 `log-diagnose.md`의 Vercel 배포 실패 섹션입니다.
> 메인 프로토콜: [log-diagnose.md](log-diagnose.md)

## 트리거 조건

- "Vercel 배포 실패", "빌드 실패", "배포 안 됨" 언급 시
- Vercel 대시보드에서 Error 상태 확인 시

---

## STEP 1. Vercel CLI로 로그 자동 수집

```bash
# 최신 배포 URL 확인
vercel ls

# 해당 배포 로그 조회
vercel logs <deployment-url>

# 자동화 스크립트 사용 (권장)
npm run logs:vercel
```

## STEP 2. 오류 유형 분류

| 로그 패턴            | 가설 원인            | 확인 위치           |
| -------------------- | -------------------- | ------------------- |
| Type error           | TypeScript 타입 오류 | 해당 파일 라인      |
| Module not found     | import 경로 오류     | 파일 경로 확인      |
| ESLint error         | ESLint 규칙 위반     | .eslintrc 설정      |
| Cannot find module   | 의존성 누락          | package.json        |
| Environment variable | 환경 변수 누락       | Vercel Variables    |
| Build exceeded       | 번들 사이즈 초과     | 코드 스플리팅 필요  |
| Out of memory        | 빌드 메모리 부족     | Dynamic import 적용 |

## STEP 3. 원인 검증

```
□ vercel logs 출력 내용 전문 확인
□ 로컬에서 npm run build 실행하여 동일 오류 재현
□ npx tsc --noEmit으로 타입 오류 확인
□ npm run lint로 ESLint 오류 확인
□ Vercel 대시보드 Environment Variables 확인
```

## STEP 4. 수정 및 재배포

```
□ 원인 확정 후 코드 또는 환경 변수 수정
□ 로컬 npm run build 성공 확인
□ git push origin main → Vercel 자동 재배포
□ npm run logs:vercel:live 로 재배포 로그 실시간 확인
```
