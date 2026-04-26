import { cookies } from 'next/headers';
import type { components } from '@/api-contract/generated/api-types';

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const sort = searchParams.get('sort') === 'popularity' ? 'popularity' : 'latest';

  const apiBaseUrl = process.env.API_BASE_URL;
  if (!apiBaseUrl) {
    return Response.json({ error: 'Server misconfigured' }, { status: 500 });
  }

  const cookieStore = await cookies();
  const token = cookieStore.get('ssac_auth')?.value;
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const upstream = await fetch(`${apiBaseUrl}/api/news?sort=${sort}`, {
    headers,
    cache: 'no-store',
  });

  if (!upstream.ok) {
    return Response.json({ error: 'Upstream error' }, { status: upstream.status });
  }

  const body = (await upstream.json()) as {
    data?: components['schemas']['NewsListResponse'];
  };
  return Response.json(body.data ?? { totalCount: 0, hasNext: false, contents: [] });
}
