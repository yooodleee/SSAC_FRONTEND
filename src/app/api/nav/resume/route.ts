import { cookies } from 'next/headers';
import type { NavResumeData } from '@/types';

export async function GET(): Promise<Response> {
  const cookieStore = await cookies();
  if (!cookieStore.has('ssac_auth')) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data: NavResumeData = {
    item: {
      contentId: '5',
      title: '주식 투자 기초',
      lastPosition: '/content/5',
    },
  };
  return Response.json(data);
}
