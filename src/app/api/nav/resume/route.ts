import { cookies } from 'next/headers';
import type { components } from '@/api-contract/generated/api-types';

export async function GET(): Promise<Response> {
  const cookieStore = await cookies();
  const token = cookieStore.get('ssac_auth')?.value;
  if (!token) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const apiBaseUrl = process.env.API_BASE_URL;
  if (!apiBaseUrl) {
    return Response.json({ error: 'Server misconfigured' }, { status: 500 });
  }

  const upstream = await fetch(`${apiBaseUrl}/api/resume`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  if (!upstream.ok) {
    return Response.json({ error: 'Upstream error' }, { status: upstream.status });
  }

  const body = (await upstream.json()) as {
    data?: components['schemas']['ResumeResponse'];
  };
  return Response.json(body.data ?? { hasResume: false });
}
