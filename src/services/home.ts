import { apiClient } from './api';
import { getDailyQuiz } from '@/data/quiz-data';
import { CAROUSEL_ITEMS } from '@/data/carousel-data';
import type { CarouselItem, ContentItem, Post, QuizItem } from '@/types';

export const homeService = {
  async getCarousel(): Promise<CarouselItem[]> {
    return CAROUSEL_ITEMS;
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
};
