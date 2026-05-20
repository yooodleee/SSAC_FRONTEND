export const DOMAIN_TABS = [
  { id: 'realestate', label: '부동산/자취', href: '/content/realestate' },
  { id: 'tax', label: '세금/연말정산', href: '/content/tax' },
  { id: 'investment', label: '재테크/신용', href: '/content/investment' },
  { id: 'labor', label: '근로/급여', href: '/content/labor' },
  { id: 'scholarship', label: '학자금/장학금', href: '/content/scholarship' },
  { id: 'insurance', label: '사회보험/복지', href: '/content/insurance' },
  { id: 'budget', label: '소비/예산관리', href: '/content/budget' },
] as const;

export const NAV_MENU_ITEMS = [
  { id: 'contents', label: '모든 콘텐츠', href: '/content' },
  { id: 'news', label: '새로운 소식', href: '/news' },
  { id: 'tech', label: 'TECH', href: '/#tech' },
  { id: 'faq', label: 'FAQ', href: '/#faq' },
] as const;

export type NavMenuId = (typeof NAV_MENU_ITEMS)[number]['id'];
export type DomainTabId = (typeof DOMAIN_TABS)[number]['id'];
