import { cookies } from 'next/headers';
import type { NavSegmentData } from '@/types';

export async function GET(): Promise<Response> {
  const cookieStore = await cookies();
  if (!cookieStore.has('ssac_auth')) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data: NavSegmentData = { segment: 'advanced' };
  return Response.json(data);
}
