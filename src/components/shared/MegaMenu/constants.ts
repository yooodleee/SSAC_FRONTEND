export { DOMAIN_TABS } from '@/constants/domains';
export type { DomainTab } from '@/constants/domains';

export const NAV_MENU_ITEMS = [
  { id: 'contents', label: '모든 콘텐츠', href: '/content' },
  { id: 'news', label: '새로운 소식', href: '/news' },
  { id: 'tech', label: 'TECH', href: '/#tech' },
  { id: 'faq', label: 'FAQ', href: '/#faq' },
] as const;

export type NavMenuId = (typeof NAV_MENU_ITEMS)[number]['id'];
// UI-only type: key of DOMAIN_TABS
export type DomainTabKey =
  | 'realestate'
  | 'tax'
  | 'investment'
  | 'work'
  | 'scholarship'
  | 'welfare'
  | 'budget'
  | 'series';
