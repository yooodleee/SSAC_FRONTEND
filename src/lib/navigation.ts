/**
 * 메뉴 트리 정의 — 정적 데이터 (API 없음, 빌드 타임 인라인)
 *
 * 설계 원칙:
 * - Task-oriented: 사용자 목적 기준 그룹화 (기능 기준 X)
 * - Depth ≤ 2: 최상위 + 하위 1단계까지만 허용
 * - RESTful/semantic URL: /[domain]/[action]
 */

export interface NavChild {
  readonly label: string;
  readonly href: string;
  readonly description: string;
}

export interface NavItem {
  readonly label: string;
  readonly href: string;
  /** Heroicons outline 24×24 path data */
  readonly iconPath: string;
  readonly children?: readonly NavChild[];
  /** 로그인한 사용자에게만 노출 */
  readonly requiresAuth?: true;
}

export const NAV_ITEMS: readonly NavItem[] = [
  {
    label: '홈',
    href: '/',
    iconPath:
      'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  },
  {
    label: '퀴즈',
    href: '/quiz',
    iconPath:
      'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
    children: [
      {
        label: '오늘의 퀴즈',
        href: '/quiz/daily',
        description: '매일 새로운 퀴즈에 도전하세요',
      },
      {
        label: '퀴즈 기록',
        href: '/quiz/history',
        description: '내 풀이 내역과 점수를 확인하세요',
      },
    ],
  },
  {
    label: '콘텐츠',
    href: '/content',
    iconPath:
      'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
    children: [
      {
        label: '전체 콘텐츠',
        href: '/content',
        description: '모든 학습 콘텐츠를 탐색하세요',
      },
      {
        label: '관심 분야',
        href: '/content/interests',
        description: '내 관심사 기반 맞춤 추천',
      },
    ],
  },
  {
    label: '뉴스',
    href: '/news',
    iconPath:
      'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z',
    children: [
      {
        label: '최신 뉴스',
        href: '/news',
        description: '오늘의 주요 소식을 확인하세요',
      },
      {
        label: '주요 뉴스',
        href: '/news/featured',
        description: '에디터가 추천하는 핵심 뉴스',
      },
    ],
  },
  {
    label: '마이페이지',
    href: '/my',
    iconPath: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    requiresAuth: true,
    children: [
      {
        label: '내 정보',
        href: '/my/profile',
        description: '프로필 및 학습 현황 보기',
      },
      {
        label: '설정',
        href: '/my/settings',
        description: '알림 및 환경 설정 변경',
      },
    ],
  },
] as const;

/** 사용자 세그먼트별 추가 메뉴 항목 */
export const SEGMENT_NAV_ITEMS: Record<'beginner' | 'advanced', readonly NavItem[]> = {
  beginner: [
    {
      label: '입문 가이드',
      href: '/content/guide',
      iconPath:
        'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
    },
  ],
  advanced: [
    {
      label: '심화 분석',
      href: '/content/analytics',
      iconPath:
        'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    },
  ],
};
