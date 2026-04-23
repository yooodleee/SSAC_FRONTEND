// ============================================================
// Common API Types
// ============================================================

export interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

// ============================================================
// Example Domain Types (JSONPlaceholder)
// ============================================================

export interface Post {
  id: number;
  userId: number;
  title: string;
  body: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  username: string;
}

// ============================================================
// Home Domain Types
// ============================================================

export interface CarouselItem {
  id: number;
  title: string;
  imageUrl: string;
}

export interface QuizItem {
  id: number;
  question: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explanation: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface QuizAttempt {
  quizId: number;
  selectedIndex: number;
  isCorrect: boolean;
  answeredAt: string;
}

export interface QuizSession {
  sessionId: string;
  date: string;
  attempts: QuizAttempt[];
  score: number;
  total: number;
}

export interface ContentItem {
  id: number;
  title: string;
  body: string;
}

export interface NewsItem {
  id: number;
  title: string;
  summary: string;
  source: string;
  category: string;
  publishedAt: string;
}

export interface HomeData {
  carousel: CarouselItem[];
  quiz: QuizItem[];
  content: ContentItem[];
  news: NewsItem[];
}

// ============================================================
// Mypage Domain Types
// ============================================================

/** GET /api/v1/users/me → data */
export interface UserProfile {
  id: number;
  email: string;
  nickname: string;
  createdAt: string;
}

export interface PeriodStat {
  label: string;
  attemptCount: number;
  totalScore: number;
  averageScore: number;
  accuracyRate: number;
}

/** GET /api/v1/quiz-attempts/stats → data */
export interface QuizStats {
  totalScore: number;
  totalAttempts: number;
  averageScore: number;
  totalCorrect: number;
  totalQuestions: number;
  accuracyRate: number;
  periodStats: PeriodStat[];
}

/** Standard backend envelope: { success, data, message } */
export interface BackendResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface QuizHistoryItem {
  id: number;
  quizTitle: string;
  category: string;
  score: number;
  isCorrect: boolean;
  answeredAt: string;
}

export interface QuizHistoryPage {
  items: QuizHistoryItem[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// ============================================================
// UI / Component Types
// ============================================================

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

// ============================================================
// Search Domain Types
// ============================================================

export interface SearchResult {
  id: number;
  title: string;
  summary: string;
  category: string;
  relevanceScore: number;
}

export interface SearchSuggestion {
  keyword: string;
  count: number;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  query: string;
  popularKeywords: SearchSuggestion[];
}
