# SSAC 디자인 시스템

> FE 에이전트가 UI/UX 작업 시 반드시 이 파일을 먼저 읽고 설계 지침을 준수한다.
> DESIGN.md에 정의되지 않은 디자인 결정은 임의로 하지 않고 사용자에게 확인 후 DESIGN.md에 추가한다.
>
> 컴포넌트 · 레이아웃 · UX 세부 지침: [DESIGN-components.md](DESIGN-components.md)

---

## 브랜드 아이덴티티

### 서비스 핵심 가치

- 타겟 : 수능 끝난 고3 / 사회초년생
- 목표 : 금융 문맹 탈출의 첫 걸음
- 톤앤매너: "처음이어도 괜찮아" — 친근하고 쉽게
- 감성 : Notion 미니멀 + Apple 부드러움

### 마스코트

- 이름 : 싹 (SSAC)
- 활용 : 로딩 / 빈 상태 / 레벨업 / 온보딩 등
- 원칙 : 사용자가 어렵거나 막막할 때 등장하여 응원

### 언어 원칙

- 금융 전문 용어는 반드시 쉬운 말로 풀어 설명한다
- 문장은 짧고 친근하게 작성한다
- 어려운 용어 첫 등장 시 툴팁으로 즉시 설명한다
  예)
  ❌ "임대차 계약 시 확정일자를 취득하여야 합니다"
  ✅ "계약서 도장 찍은 날짜를 꼭 확인받으세요"

---

## 컬러 시스템

### Primary (새싹 그린)

--color-primary : #4CAF82 /_ 버튼, 강조, 브랜드 _/
--color-primary-light : #E8F5EE /_ 배경, 태그 _/
--color-primary-dark : #388E60 /_ 호버, 눌림 상태 _/

### Neutral

--color-text-primary : #1A1A1A /_ 메인 텍스트 _/
--color-text-secondary : #6B6B6B /_ 서브 텍스트 _/
--color-text-disabled : #BBBBBB /_ 비활성 텍스트 _/
--color-bg-page : #FFFFFF /_ 페이지 배경 _/
--color-bg-card : #F5F5F5 /_ 카드 배경 _/
--color-border : #E8E8E8 /_ 구분선 _/

### Semantic

--color-danger : #FF6B6B /_ 위험 / 손실 _/
--color-warning : #FFB347 /_ 경고 / 만기 임박 _/
--color-success : #4CAF82 /_ 성공 / 완료 _/
--color-info : #5B9BD5 /_ 정보 / 안내 _/

### 다크모드

--color-dark-bg-page : #121212
--color-dark-bg-card : #1E1E1E
--color-dark-border : #2D2D2D
--color-dark-text : #F5F5F5

### 사용 원칙

- 컬러 토큰 외 임의의 색상 사용 금지
- 텍스트와 배경 간 WCAG AA 명도 대비 (4.5:1 이상) 준수
- 다크모드 대응은 CSS 변수 기반으로 처리

---

## 타이포그래피

### 폰트

기본 폰트 : Pretendard (한글 / 영문 모두 적용)
fallback : -apple-system, BlinkMacSystemFont, sans-serif

### 스케일

--font-size-title-lg : 28px / Bold /_ 메인 타이틀 _/
--font-size-title-md : 22px / Bold /_ 페이지 제목 _/
--font-size-title-sm : 18px / SemiBold /_ 섹션 제목 _/
--font-size-body-lg : 16px / Medium /_ 카드 제목 _/
--font-size-body-md : 15px / Regular /_ 본문 _/
--font-size-body-sm : 13px / Regular /_ 캡션 / 태그 _/

### 행간

제목 : line-height 1.3
본문 : line-height 1.6

### 사용 원칙

- 한 화면에 폰트 크기는 최대 4가지 이하로 제한
- 본문 최소 폰트 크기 13px 이하 사용 금지
- Bold는 제목 / 강조에만 사용, 본문 남용 금지

---

## 에이전트 준수 규칙

### 디자인 작업 전 체크리스트

□ 컬러 토큰을 사용하는가 (임의 색상 사용 금지)
□ 폰트 스케일을 준수하는가
□ 카드 컴포넌트 구조를 따르는가 → [DESIGN-components.md](DESIGN-components.md)
□ 금융 용어에 툴팁이 적용되었는가
□ 로딩 / 빈 상태 / 에러 상태가 모두 구현되었는가
□ 모바일 터치 영역 48px 이상인가
□ WCAG AA 명도 대비를 충족하는가

### 금지 패턴

- 컬러 토큰 외 임의 색상 하드코딩 금지
- 금융 전문 용어 툴팁 없이 단독 사용 금지
- 빈 상태에서 빈 화면 그대로 노출 금지
- 기술적 에러 메시지 사용자에게 직접 노출 금지
- 터치 영역 48px 미만 버튼 생성 금지

### DESIGN.md 업데이트 규칙

- 새로운 컴포넌트 추가 시 DESIGN.md 또는 DESIGN-components.md에 반드시 명세 추가
- 컬러 / 타이포 변경 시 DESIGN.md 먼저 수정 후 코드 반영
- DESIGN.md에 없는 디자인 결정은 사용자에게 확인 후 진행
