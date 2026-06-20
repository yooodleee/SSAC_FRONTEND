## 2026-06-20 수동 동기화 (BE 사전 반영)

**응답 구조 변경 (Spring Page<T> → PageResponse<T>):**
  ⚠️ GET /api/v1/quiz-attempts — page 파라미터 0-based → 1-based
  ⚠️ GET /api/v1/quiz-attempts/guest — page 파라미터 0-based → 1-based
  ⚠️ GET /api/v1/admin/users — page 파라미터 0-based → 1-based

**필드 매핑:**
  - content → data.items
  - totalElements → data.totalCount
  - pageable.pageNumber (0-based) → data.page (1-based)
  - pageable.pageSize → data.size
  - last: false 역산 → data.hasNext

**제거된 스키마:**
  - PageableObject (PageQuizAttemptSummaryResponse, PageUserSummaryResponse에서만 참조됨)

> 3개 엔드포인트 모두 FE 미구현 상태 — BE swagger 업데이트 대기 중

---

## 2026-05-18 18:16 동기화

**추가된 엔드포인트:**
  + GET /api/v1/auth/email/check
  + POST /api/v1/auth/register


## 2026-05-15 17:46 동기화

**추가된 엔드포인트:**
  + DELETE /api/v1/onboarding/result
  + GET /api/v1/users/mypage
  + PATCH /api/v1/users/type
  + POST /api/v1/contents/{contentId}/complete
  + PUT /api/v1/users/interests


## 2026-05-14 15:26 동기화

**추가된 엔드포인트:**
  + GET /api/v1/onboarding/questions
  + POST /api/v1/onboarding/skip
  + POST /api/v1/onboarding/submit


## 2026-05-13 10:55 동기화

**추가된 엔드포인트:**
  + GET /api/v1/admin/logs/errors
  + POST /api/v1/auth/token


## 2026-05-05 21:37 동기화

**추가된 엔드포인트:**
  + DELETE /api/auth/dev/users


## 2026-05-04 19:17 동기화

**추가된 엔드포인트:**
  + GET /api/auth/dev/mock-new-user


## 2026-05-04 18:23 동기화

**추가된 엔드포인트:**
  + GET /api/auth/nickname/check
  + POST /api/auth/register
  + POST /api/auth/terms


## 2026-04-29 20:47 동기화

**추가된 엔드포인트:**
  + GET /api/ab-test/menu
  + GET /api/v1/admin/menu-stats
  + POST /api/events/menu-click


## 2026-04-28 14:58 동기화

**추가된 엔드포인트:**
  + GET /api/v1/quiz-attempts/guest


## 2026-04-27 12:41 동기화

**추가된 엔드포인트:**
  + GET /login/oauth2/code/kakao
  + GET /oauth2/authorization/kakao


## 2026-04-27 00:10 동기화

**추가된 엔드포인트:**
  + GET /api/news


## 2026-04-26 21:42 동기화

**추가된 엔드포인트:**
  + GET /api/notification
  + GET /api/resume
  + GET /api/user/segment
  + PATCH /api/notification/read-all
  + PATCH /api/notification/{id}/read
  + PUT /api/resume/{id}


## 2026-04-24 22:00 동기화

**추가된 엔드포인트:**

- GET /api/v1/recommendations

## 2026-04-24 18:24 동기화

**추가된 엔드포인트:**

- POST /api/v1/users/me/logout

## 2026-04-24 17:57 동기화

**추가된 엔드포인트:**

- GET /api/v1/admin/users
- PATCH /api/v1/admin/users/{userId}/role

## 2026-04-24 12:26 동기화

**추가된 엔드포인트:**

- GET /api/v1/auth/naver/callback
- GET /api/v1/auth/naver/login
- GET /api/v1/quiz-attempts
- GET /api/v1/quiz-attempts/stats
- GET /api/v1/quiz-attempts/{attemptId}
- GET /api/v1/users/me
- PATCH /api/v1/users/me/nickname
- POST /api/v1/auth/guest
- POST /api/v1/auth/logout
- POST /api/v1/auth/reissue
- POST /api/v1/quiz-attempts
  **제거된 엔드포인트:**

*

# API CHANGELOG

> 이 파일은 `scripts/sync-api.sh`가 자동으로 갱신합니다.
> 수동 편집 금지 — 변경 이력은 동기화 스크립트가 관리합니다.

---

<!-- 동기화 실행 시 아래에 항목이 자동 추가됩니다 -->
