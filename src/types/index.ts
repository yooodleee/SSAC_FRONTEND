import type { components } from '@/api-contract/generated/api-types';

// ============================================================
// Migrated API Types
// 수동 정의 제거 → api-contract/generated/api-types.ts 스키마 참조
// ============================================================

/** Migrated: components['schemas']['ProfileResponse'] */
export type UserProfile = Required<components['schemas']['ProfileResponse']>;

/** Migrated: components['schemas']['PeriodStatResponse'] */
export type PeriodStat = Required<components['schemas']['PeriodStatResponse']>;

/** Migrated: components['schemas']['UserStatsResponse'] */
export type QuizStats = Required<
  Omit<components['schemas']['UserStatsResponse'], 'periodStats'>
> & {
  periodStats: PeriodStat[];
};

// ============================================================
// ⚠️ API Types — Pending Migration
// api-contract/generated/api-types.ts에 해당 스키마 없음
// BE 팀에 Contract 추가 요청 후 api-types.ts 재생성 시 이전 예정
// ============================================================

// ⚠️ API type: BE Contract 미확인 — 수동 작성 금지 대상
export interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

// ⚠️ API type: BE Contract 미확인 — 수동 작성 금지 대상
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ⚠️ API type: BE Contract 미확인 — ErrorResponse.errors 하위 타입
export interface FieldError {
  field: string;
  message: string;
}

// ⚠️ API 에러 응답 타입: api-types.ts의 ApiResponseError로 대체 검토 필요
export interface ErrorResponse {
  status: number;
  code: string;
  message: string;
  errors?: FieldError[];
  timestamp: string;
}

// ⚠️ API 에러 타입: api-types.ts의 ApiResponseError로 대체 검토 필요
export interface ApiError {
  status: number;
  code?: string;
  message: string;
  errors?: FieldError[];
}

// ============================================================
// ⚠️ Example Domain Types (JSONPlaceholder)
// BE Contract 미확인 — 실제 API Contract 확인 필요
// ============================================================

// ⚠️ API type: JSONPlaceholder 예시 타입 — 실제 API Contract 확인 필요
export interface Post {
  id: number;
  userId: number;
  title: string;
  body: string;
}

// ⚠️ API type: JSONPlaceholder 예시 타입 — 실제 API Contract 확인 필요
export interface User {
  id: number;
  name: string;
  email: string;
  username: string;
}

// ============================================================
// ⚠️ Home Domain Types
// api-contract/generated/api-types.ts에 없음 — BE 팀 확인 필요
// ============================================================

// ⚠️ API type: api-types.ts에 없음 — BE 팀 확인 필요
export interface CarouselItem {
  id: number;
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  bgGradient?: string;
  icon?: string;
  badge?: string;
  ctaLabel?: string;
  linkUrl: string;
  linkType: 'internal' | 'external';
}

// ⚠️ API type: api-types.ts에 없음 — BE 팀 확인 필요
export interface CarouselTrackEvent {
  itemId: number;
  position: number;
  eventType: 'impression' | 'click' | 'swipe';
  stayDurationMs?: number;
  sessionId: string;
  timestamp: string;
}

// ⚠️ API type: api-types.ts에 없음 — BE 팀 확인 필요
export interface CarouselItemStats {
  itemId: number;
  impressions: number;
  clicks: number;
  swipes: number;
  totalStayMs: number;
  ctr: number;
  avgStayMs: number;
}

// ⚠️ API type: api-types.ts에 없음 — BE 팀 확인 필요
export interface QuizItem {
  id: number;
  question: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explanation: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

// ⚠️ API type: api-types.ts에 없음 — BE 팀 확인 필요
export interface QuizAttempt {
  quizId: number;
  selectedIndex: number;
  isCorrect: boolean;
  answeredAt: string;
}

// ⚠️ API type: api-types.ts에 없음 — BE 팀 확인 필요
export interface QuizSession {
  sessionId: string;
  date: string;
  attempts: QuizAttempt[];
  score: number;
  total: number;
}

// ⚠️ API type: api-types.ts에 없음 — BE 팀 확인 필요
export interface ContentItem {
  id: number;
  title: string;
  body: string;
}

// ⚠️ API type: api-types.ts에 없음 — BE 팀 확인 필요
export interface HomeData {
  carousel: CarouselItem[];
  quiz: QuizItem[];
  content: ContentItem[];
}

// ============================================================
// ⚠️ Mypage Domain Types
// QuizHistoryItem: QuizAttemptSummaryResponse와 필드 불일치 — BE 팀 확인 필요
// ============================================================

// ⚠️ API type: QuizAttemptSummaryResponse와 필드 불일치 — BE 팀 확인 필요
export interface QuizHistoryItem {
  id: number;
  quizTitle: string;
  category: string;
  score: number;
  isCorrect: boolean;
  answeredAt: string;
}

// ⚠️ API type: api-types.ts에 없음 — BE 팀 확인 필요
export interface QuizHistoryPage {
  items: QuizHistoryItem[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// ============================================================
// ⚠️ Signup Domain Types
// api-contract/generated/api-types.ts에 없음 — BE 팀 swagger 추가 후 이전 예정
// ============================================================

// POST /api/auth/terms — TermsRequest.java 기준
export interface TermsAgreements {
  serviceTerm: boolean;
  privacyTerm: boolean;
  ageVerification: boolean;
  marketingTerm: boolean;
}

export interface TermsAgreementRequest {
  agreements: TermsAgreements;
}

// GET /api/auth/nickname/check — NicknameCheckResponse 기준
export interface NicknameCheckResponse {
  isAvailable: boolean;
}

// Derived from components['schemas']['RegisterRequest']['userType']
export type UserType = Required<components['schemas']['RegisterRequest']>['userType'];

// POST /api/auth/register — RegisterRequest 기준 (tempToken은 signupService가 자동 첨부)
export interface SignupCompleteRequest {
  nickname: string;
  userType: UserType;
  guestId?: string;
}

// ============================================================
// UI / Component Types
// ============================================================

// UI-only type: not derived from API contract
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';

// UI-only type: not derived from API contract
export type ButtonSize = 'sm' | 'md' | 'lg';

// ============================================================
// ⚠️ Content Domain Types
// api-contract/generated/api-types.ts에 없음 — BE 팀 확인 필요
// ============================================================

// ⚠️ API type: api-types.ts에 없음 — BE 팀 확인 필요
export interface PopularContent {
  id: number;
  title: string;
  viewCount: number;
  likeCount: number;
}

// ⚠️ API type: api-types.ts에 없음 — BE 팀 확인 필요
export interface PopularContentResponse {
  items: PopularContent[];
  aggregationLabel: string;
}

// ⚠️ API type: api-types.ts에 없음 — BE 팀 확인 필요
export interface NewContent {
  id: number;
  title: string;
  registeredAt: string;
}

// ⚠️ API type: api-types.ts에 없음 — BE 팀 확인 필요
export interface RecommendedContent {
  id: number;
  title: string;
  summary: string;
}

// ⚠️ API type: api-types.ts에 없음 — BE 팀 확인 필요
export interface ContentDetail {
  id: number;
  title: string;
  body: string;
  category: string;
  publishedAt: string;
}

// ============================================================
// ⚠️ Search Domain Types
// api-contract/generated/api-types.ts에 없음 — BE 팀 확인 필요
// ============================================================

// ⚠️ API type: api-types.ts에 없음 — BE 팀 확인 필요
export interface SearchResult {
  id: number;
  title: string;
  summary: string;
  category: string;
  relevanceScore: number;
}

// ⚠️ API type: api-types.ts에 없음 — BE 팀 확인 필요
export interface SearchSuggestion {
  keyword: string;
  count: number;
}

// ⚠️ API type: api-types.ts에 없음 — BE 팀 확인 필요
export interface SearchResponse {
  results: SearchResult[];
  total: number;
  query: string;
  popularKeywords: SearchSuggestion[];
}

// ============================================================
// ⚠️ Home V1 Domain Types
// /api/v1/home 응답 — api-types.ts의 ApiResponseObject(data: {})로만 정의됨
// BE 팀 swagger schema 추가 요청 후 api-types.ts 이전 예정
// ============================================================

// ⚠️ API type: /api/v1/home user 필드 — api-types.ts에 없음
export interface HomeUserInfo {
  nickname: string;
  level: 'SEED' | 'SPROUT' | 'TREE';
}

// ⚠️ API type: /api/v1/home todayCard 필드 — api-types.ts에 없음
export interface TodayCardDto {
  id: string;
  title: string;
  category: string;
  categoryEmoji?: string;
  estimatedMinutes: number;
}

// ⚠️ API type: /api/v1/home continueLearning 필드 — api-types.ts에 없음
export interface ContinueLearningDto {
  id: string;
  title: string;
  progressPercent: number;
}

// ⚠️ API type: /api/v1/home todayQuiz 필드 — api-types.ts에 없음
export interface TodayQuizDto {
  id: string;
  question: string;
}

// ⚠️ API type: /api/v1/home categories 필드 — api-types.ts에 없음
export interface CategorySummaryDto {
  id: string;
  emoji: string;
  name: string;
  completedCount: number;
  totalCount: number;
}

// ⚠️ API type: /api/v1/home recommendedContents — ContentItemDto 확장 (category 추가)
export interface HomeContentItemDto extends Required<components['schemas']['ContentItemDto']> {
  category?: string;
  categoryEmoji?: string;
}

// ⚠️ API type: /api/v1/home 전체 응답 — api-types.ts에 없음
export interface HomeV1Data {
  user: HomeUserInfo;
  todayCard: TodayCardDto | null;
  continueLearning: ContinueLearningDto | null;
  todayQuiz: TodayQuizDto | null;
  recommendedContents: HomeContentItemDto[];
  categories: CategorySummaryDto[];
  onboardingRequired?: boolean;
  redirectTo?: string;
}
