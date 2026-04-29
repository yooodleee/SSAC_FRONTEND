import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';

export async function PATCH(request: NextRequest): Promise<Response> {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;
  if (!token) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const apiBaseUrl = process.env.API_BASE_URL;
  if (!apiBaseUrl) {
    return Response.json({ error: 'Server misconfigured' }, { status: 500 });
  }

  const body = (await request.json()) as { nickname?: string };

  const upstream = await fetch(`${apiBaseUrl}/api/v1/users/me/nickname`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ nickname: body.nickname }),
  });

  const data = (await upstream.json().catch(() => ({}))) as unknown;
  return Response.json(data, { status: upstream.status });
}
