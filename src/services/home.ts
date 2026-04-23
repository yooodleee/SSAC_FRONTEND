import { apiClient } from './api';
import { getDailyQuiz } from '@/data/quiz-data';
import type { CarouselItem, ContentItem, NewsItem, Post, QuizItem } from '@/types';

// JSONPlaceholder photo shape (internal to this service)
interface JsonPlaceholderPhoto {
  id: number;
  albumId: number;
  title: string;
  url: string;
  thumbnailUrl: string;
}

const NEWS_SOURCES = ['한국경제', '매일경제', '연합뉴스', '조선비즈', '머니투데이'];
const NEWS_CATEGORIES = ['주식', '환율', '부동산', '채권', '암호화폐', '금리', '펀드'];

export const homeService = {
  async getCarousel(): Promise<CarouselItem[]> {
    const photos = await apiClient.get<JsonPlaceholderPhoto[]>('/photos', {
      params: { albumId: 1, _limit: 5 },
    });
    return photos.map((p) => ({
      id: p.id,
      title: p.title,
      imageUrl: p.url,
    }));
  },

  async getQuiz(): Promise<QuizItem[]> {
    return getDailyQuiz();
  },

  async getContent(): Promise<ContentItem[]> {
    const posts = await apiClient.get<Post[]>('/posts', { params: { _start: 3, _limit: 6 } });
    return posts.map(
      (p): ContentItem => ({
        id: p.id,
        title: p.title,
        body: p.body,
      }),
    );
  },

  async getNews(): Promise<NewsItem[]> {
    const posts = await apiClient.get<Post[]>('/posts', { params: { _start: 9, _limit: 10 } });
    return posts.map((p, i): NewsItem => {
      // 앞 7개는 24시간 이내(최신), 나머지는 24시간 초과로 분산
      const hoursAgo = i < 7 ? i * 2 + 1 : 25 + i * 4;
      const sentences = p.body
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 2)
        .join(' ');
      return {
        id: p.id,
        title: p.title,
        summary: sentences || p.body.slice(0, 120),
        source: NEWS_SOURCES[i % NEWS_SOURCES.length]!,
        category: NEWS_CATEGORIES[i % NEWS_CATEGORIES.length]!,
        publishedAt: new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString(),
      };
    });
  },
};
