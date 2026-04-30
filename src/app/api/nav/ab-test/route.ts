import { cookies } from 'next/headers';

export interface AbTestResponse {
  group: 'A' | 'B';
}

interface AbTestApiResponse {
  success: boolean;
  data: AbTestResponse;
  message: string | null;
  loginRequired: boolean;
}

export async function GET(): Promise<Response> {
  const apiBaseUrl = process.env.API_BASE_URL;

  if (apiBaseUrl) {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;
    const guestId = cookieStore.get('guestId')?.value;

    try {
      const upstream = await fetch(`${apiBaseUrl}/api/ab-test/menu`, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
          ...(guestId && { 'X-Guest-Id': guestId }),
        },
        cache: 'no-store',
      });

      if (upstream.ok) {
        const body = (await upstream.json()) as AbTestApiResponse;
        return Response.json({ group: body.data.group } satisfies AbTestResponse);
      }
    } catch {
      // 백엔드 미응답 시 폴백으로 진행
    }
  }

  // 폴백: 기본 그룹 A 반환 (백엔드 연동 전 또는 오류 시)
  return Response.json({ group: 'A' } satisfies AbTestResponse);
}
