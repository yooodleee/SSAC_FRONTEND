import { cookies } from 'next/headers';

export async function PATCH(): Promise<Response> {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;
  if (!token) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const apiBaseUrl = process.env.API_BASE_URL;
  if (!apiBaseUrl) {
    return Response.json({ error: 'Server misconfigured' }, { status: 500 });
  }

  const upstream = await fetch(`${apiBaseUrl}/api/notification/read-all`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
  });

  return new Response(null, { status: upstream.status });
}
