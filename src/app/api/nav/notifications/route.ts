import { cookies } from 'next/headers';
import type { NavNotificationsData } from '@/types';

export async function GET(): Promise<Response> {
  const cookieStore = await cookies();
  if (!cookieStore.has('ssac_auth')) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data: NavNotificationsData = { unreadCount: 3 };
  return Response.json(data);
}
