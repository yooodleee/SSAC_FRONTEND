// UI-only type: not derived from API contract
export interface DomainTab {
  key: string;
  label: string;
  emoji: string;
  route: string;
  tagColor: string;
  tagTextColor: string;
  panel?: React.ReactNode;
}

export const DOMAIN_ROUTES = {
  realestate: '/contents/realestate',
  tax: '/contents/tax',
  investment: '/contents/investment',
  work: '/contents/work',
  scholarship: '/contents/scholarship',
  welfare: '/contents/welfare',
  budget: '/contents/budget',
  series: '/contents/series',
} as const;

export const DOMAIN_LABELS = {
  realestate: '부동산/자취',
  tax: '세금/연말정산',
  investment: '재테크/신용',
  work: '근로/급여',
  scholarship: '학자금/장학금',
  welfare: '사회보험/복지',
  budget: '소비/예산관리',
  series: '시리즈',
} as const;

export const DOMAIN_EMOJIS = {
  realestate: '🏠',
  tax: '📋',
  investment: '💰',
  work: '💼',
  scholarship: '🎓',
  welfare: '🤝',
  budget: '📊',
  series: '📚',
} as const;

export const DOMAIN_TABS: DomainTab[] = [
  {
    key: 'realestate',
    label: '부동산/자취',
    emoji: '🏠',
    route: '/contents/realestate',
    tagColor: '#EF5350',
    tagTextColor: '#FFFFFF',
  },
  {
    key: 'tax',
    label: '세금/연말정산',
    emoji: '📋',
    route: '/contents/tax',
    tagColor: '#FF9800',
    tagTextColor: '#FFFFFF',
  },
  {
    key: 'investment',
    label: '재테크/신용',
    emoji: '💰',
    route: '/contents/investment',
    tagColor: '#4CAF50',
    tagTextColor: '#FFFFFF',
  },
  {
    key: 'work',
    label: '근로/급여',
    emoji: '💼',
    route: '/contents/work',
    tagColor: '#2196F3',
    tagTextColor: '#FFFFFF',
  },
  {
    key: 'scholarship',
    label: '학자금/장학금',
    emoji: '🎓',
    route: '/contents/scholarship',
    tagColor: '#00BCD4',
    tagTextColor: '#FFFFFF',
  },
  {
    key: 'welfare',
    label: '사회보험/복지',
    emoji: '🤝',
    route: '/contents/welfare',
    tagColor: '#FFC107',
    tagTextColor: '#FFFFFF',
  },
  {
    key: 'budget',
    label: '소비/예산관리',
    emoji: '📊',
    route: '/contents/budget',
    tagColor: '#9C27B0',
    tagTextColor: '#FFFFFF',
  },
  {
    key: 'series',
    label: '시리즈',
    emoji: '📚',
    route: '/contents/series',
    tagColor: '#E91E93',
    tagTextColor: '#FFFFFF',
  },
];
