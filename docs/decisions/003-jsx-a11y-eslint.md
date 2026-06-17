# ADR-003: eslint-plugin-jsx-a11y 도입

| 항목          | 내용        |
| ------------- | ----------- |
| 날짜          | 2026-06-17  |
| 상태          | Accepted    |
| 담당 에이전트 | Claude Code |

## 컨텍스트

TD-005 — 접근성 검사 부재. aria 속성 미검증, 클릭 이벤트 키보드 미대응 등 a11y 위반이 코드베이스 전반에 누적되고 있었으나 감지 수단이 없었음.

## 결정 사항

`eslint-plugin-jsx-a11y` v6.10.2를 설치하고 ESLint flat config에 recommended 규칙을 **warn** severity로 적용.

- `nextCoreWebVitals`가 플러그인을 이미 내장하므로 플러그인 재선언 없이 rules만 오버라이드
- 초기 warn 모드: 기존 56건 위반이 존재하므로 error 전환 시 CI 즉시 차단됨 → 점진적 해결 후 error 전환

## 고려한 대안

| 대안                   | 거부 이유                                  |
| ---------------------- | ------------------------------------------ |
| error 모드로 즉시 적용 | 56건 위반으로 CI 즉시 차단, 개발 흐름 방해 |
| 적용 안 함             | a11y 위반 지속 누적, WCAG 미준수           |

## 트레이드오프

**얻는 것**: 접근성 위반 가시화, 신규 위반 즉시 감지(warn)
**잃는 것**: 56건 warn이 lint 출력에 항상 표시됨 (error 전환 전까지)

## 결과

- `package.json` devDependencies: `eslint-plugin-jsx-a11y ^6.10.2` 추가
- `eslint.config.mjs`: RULE 0 섹션에 jsxA11yWarnRules 적용
- `docs/quality.md`: TD-005 🔴 Red → 🟡 Yellow

## error 전환 기준

`npm run lint` 출력에서 `jsx-a11y/` 관련 항목이 0건이 되면 `eslint.config.mjs`의 jsxA11yWarnRules를 제거하고 `jsxA11y.flatConfigs.recommended`를 직접 사용한다 (기본 severity = error).
