import { redirect } from 'next/navigation';

/**
 * /my 경로는 /mypage로 통합됩니다.
 * 기존 북마크 또는 링크 호환성을 위해 유지됩니다.
 */
export default function MyRedirect() {
  redirect('/mypage');
}
