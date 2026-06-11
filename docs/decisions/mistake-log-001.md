# ML-001: 인증 토큰 플로우 반복 수정 (SSACFE-17)

| 항목      | 내용                       |
| --------- | -------------------------- |
| 날짜      | 2026-06-11                 |
| 발견자    | 하네스 감사 (git log 분석) |
| 에이전트  | Claude Code                |
| 반복 횟수 | 9회                        |

## 문제 설명

SSACFE-17 단일 이슈에 9건의 `fix:` 커밋이 발생했습니다.

```
533401a fix: 새로 고침 시 로그인 상태가 유지되도록 수정
0eea1de fix: reissue 뮤텍스를 구현
e80a2be fix: tryRefreshToken() authStore 갱신 추가, accessToken 누락 방어
a4c1232 fix: Set-Cookie 포워딩 패턴 교체, refreshToken 삭제 Path 수정
25a8d6b fix: Set-Cookie 포워딩을 cookieStore.set()로 전환
39fb53e fix: OnboardingSubmit userType 버그 수정
be849b7 fix: useRef에서 모듈 레벨 플래그로 수정
a8d767f fix: SessionRestoreProvider에서 redirectTo 파라미터를 읽도록 수정
fc45795 fix: SessionRestoreProvider 리다이렉트 버그 수정
```

각 수정이 새로운 버그를 유발하거나 이전 수정이 불완전한 채로 커밋되었습니다.

## 근본 원인

**BE-FE 인증 계약이 불명확한 상태에서 구현이 시작되었습니다.**

- Set-Cookie 포워딩 방식(직접 포워딩 vs `cookieStore.set()`)이 구현 도중 변경
- 토큰 재발급(reissue) 시 동시 요청 경쟁 조건을 초기 설계에서 고려하지 않음
- SessionRestoreProvider 리다이렉트 파라미터(`redirectTo`)를 명세 없이 구현
- 인증 관련 흐름 전체(로그인 → 저장 → 재발급 → 로그아웃)를 구현 전에 문서화하지 않음

## 하네스에 추가된 해결책

- [x] `AGENTS.md` 인증 구현 전 필수 확인 사항 추가 (ML-001 참조)

## 검증 방법

AGENTS.md의 "인증 구현 전 체크리스트" 항목을 구현 전 에이전트가 순서대로 실행합니다.
BE 팀과 Set-Cookie 방식, 뮤텍스 여부, 리다이렉트 파라미터 명세를 사전 합의 후 구현을 시작합니다.
