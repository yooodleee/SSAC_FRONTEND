import type { HomeV1Data } from '@/types';

async function homeV1Fetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers as Record<string, string> | undefined),
    },
  });

  let json: Record<string, unknown>;
  try {
    json = (await res.json()) as Record<string, unknown>;
  } catch {
    throw Object.assign(new Error(`HTTP ${res.status}`), { status: res.status });
  }

  if (!res.ok || json['success'] === false) {
    throw Object.assign(
      new Error((json['message'] as string | undefined) ?? `HTTP ${res.status}`),
      {
        status: res.status,
        code: (json['errorCode'] ?? json['code']) as string | undefined,
        loginRequired: json['loginRequired'] as boolean | undefined,
      },
    );
  }

  // BE wraps response in { success: true, data: ... }
  return (json['data'] ?? json) as T;
}

export const homeV1Service = {
  getHome(): Promise<HomeV1Data> {
    return homeV1Fetch<HomeV1Data>('/api/v1/home');
  },
};
