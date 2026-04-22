import type { QuizHistoryItem } from '@/types';

const CATEGORIES = ['경제', '역사', '과학', '문화', '스포츠', '시사', '기술', '예술'];
const QUIZ_TITLES = [
  '주식시장의 역사와 발전',
  '조선시대 문화와 예술',
  '양자역학 기초 개념',
  '세계 문화유산 탐구',
  '올림픽의 역사',
  '최신 AI 기술 동향',
  '인터넷과 통신의 발전',
  '한국 현대사의 주요 사건',
  '노벨상 수상자 이야기',
  '세계 경제 동향 분석',
  '기후 변화와 환경 문제',
  '우주 탐사의 역사',
  '생명공학과 유전자 연구',
  '세계 문학 작품 이해',
  '스포츠 과학의 발전',
];

const BASE_DATE = new Date('2026-04-22T00:00:00.000Z');

export const ALL_QUIZ_HISTORY: QuizHistoryItem[] = Array.from({ length: 100 }, (_, i) => {
  const date = new Date(BASE_DATE);
  date.setDate(date.getDate() - i);
  return {
    id: i + 1,
    quizTitle: QUIZ_TITLES[i % QUIZ_TITLES.length] as string,
    category: CATEGORIES[i % CATEGORIES.length] as string,
    score: 55 + ((i * 7) % 45),
    isCorrect: i % 3 !== 2,
    answeredAt: date.toISOString(),
  };
});
