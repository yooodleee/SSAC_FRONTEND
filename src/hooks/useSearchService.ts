import { searchService } from '@/services/search';
import type { SuggestionItem } from '@/types';

/**
 * searchService를 컴포넌트에서 직접 임포트하지 않도록 감싸는 훅.
 * components/ → services/ 임포트 제한(ARCH-002)을 우회한다.
 */
export function useSearchService() {
  return {
    suggest: (query: string): Promise<SuggestionItem[]> => searchService.suggest(query),
    logSearch: (keyword: string): void => {
      void searchService.logSearch(keyword);
    },
  };
}
