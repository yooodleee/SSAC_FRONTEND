# ML-002: Notion 블록 렌더러 반복 수정 (SSACFE-X)

| 항목      | 내용                       |
| --------- | -------------------------- |
| 날짜      | 2026-06-11                 |
| 발견자    | 하네스 감사 (git log 분석) |
| 에이전트  | Claude Code                |
| 반복 횟수 | 6회                        |

## 문제 설명

Notion 블록 렌더러 관련 fix·debug 커밋이 6건 연속 발생했습니다.

```
846c406 debug: Code 블록 rich text 미추출 진단 로그 추가, text.content 폴백 추가
6ff0854 fix: BLOCK_TYPE_ALIASES에 toggle 추가, has_children: true 블록 children 재귀 렌더링
6b373fb fix: Callout children fallback 추가, BLOCK_TYPE_ALIASES에 to_do 추가
648b7df fix: Notion 블록 렌더러를 BE Gson 형식에 대응하도록 수정
8001f3a fix: Notion 블록 타입명을 Notion Java SDK enum 실제명으로 반영
4b41654 fix: 다크 모드 스타일 전면 제거, Notion 블록 렌더러 실제 구조 기반 교체
```

렌더러 구현 후 실제 BE 응답 구조와 다름을 발견하고 반복 수정했습니다.

## 근본 원인

**BE의 실제 응답 형식(Gson 직렬화 구조, Java SDK enum 명칭)을 구현 전에 검증하지 않았습니다.**

- Notion Java SDK의 block type enum 명칭(`PARAGRAPH`, `HEADING_1` 등)을 가정하고 구현했으나 실제 BE 출력값과 달랐음
- `has_children: true` 블록의 재귀 렌더링 필요성을 초기 설계에서 누락
- 블록 타입별 rich text 필드 구조가 Notion 공식 문서와 BE Gson 직렬화 결과가 다름을 뒤늦게 확인
- `debug:` 커밋으로 로그를 추가한 뒤에야 실제 구조를 파악하는 사후 진단 패턴 반복

## 하네스에 추가된 해결책

- [x] `AGENTS.md` BE 데이터 형식 사전 검증 규칙 추가 (ML-002 참조)

## 검증 방법

외부 API(특히 BE가 가공한 제3자 API) 응답 구조는 구현 전에 실제 응답 샘플을 수집하고
`api-contract/generated/api-types.ts` 또는 별도 샘플 파일로 명세화한 뒤 구현을 시작합니다.
