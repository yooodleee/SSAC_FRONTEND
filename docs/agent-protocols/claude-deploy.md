# 배포 관련 규칙

> 이 파일은 `CLAUDE.md`의 배포 절차 및 Vercel 진단 규칙입니다.
> 메인 하네스: [CLAUDE.md](../../CLAUDE.md)

---

## Vercel 배포 실패 시 자동 진단 규칙

트리거 조건:

- "Vercel 배포 실패", "빌드 실패", "배포 안 됨" 언급 시
- Vercel 대시보드에서 Error 상태 확인 시

자동 실행 절차:

1. `vercel ls`로 최신 배포 URL 확인
2. `vercel logs <url>`로 빌드 로그 수집 (또는 `npm run logs:vercel`)
3. log-diagnose-vercel.md 분류표 기준으로 원인 분류
4. 로컬 `npm run build`로 동일 오류 재현 확인
5. 원인 확정 후 수정 진행
6. 수정 완료 후 `npm run logs:vercel:live`로 재배포 확인

금지 규칙:

- 로그 확인 없이 추측 기반으로 코드 수정 금지
- 사용자가 로그를 직접 복사하여 제공하도록 요청 금지
- 로컬 빌드 성공 확인 없이 push 금지

---

## 배포 전 필수 절차

main 브랜치에 push 전 반드시 아래 절차를 수행한다:

1. `pr-checklist.md` 실행
   → SC 달성 / 코드 품질 / DESIGN.md / 테스트 파일 확인

2. `npm run pre-deploy` 실행
   → TypeScript / ESLint / 빌드 모두 통과 확인

3. 모두 통과한 경우에만 push 진행

   ```bash
   git push origin main
   ```

4. 배포 실패 시 즉시 실행:
   ```bash
   npm run logs:vercel
   ```
   → 로그 확인 후 log-diagnose-vercel.md 프로토콜 실행
