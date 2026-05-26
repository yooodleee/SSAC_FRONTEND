import type { components } from '@/api-contract/generated/api-types';
import { toastStore } from '@/lib/toastStore';

type AdminContentListResponse = components['schemas']['AdminContentListResponse'];
type AdminContentCreateResponse = components['schemas']['AdminContentCreateResponse'];
type AdminContentDetailResponse = components['schemas']['AdminContentDetailResponse'];
type ApiResponseAdminContentCreateResponse =
  components['schemas']['ApiResponseAdminContentCreateResponse'];
type ApiResponseAdminContentDetailResponse =
  components['schemas']['ApiResponseAdminContentDetailResponse'];
type ApiResponseAdminContentListResponse =
  components['schemas']['ApiResponseAdminContentListResponse'];
type ApiResponseAdminContentPublishResponse =
  components['schemas']['ApiResponseAdminContentPublishResponse'];
type ApiResponseAdminImageUploadResponse =
  components['schemas']['ApiResponseAdminImageUploadResponse'];
type UpdateContentRequest = components['schemas']['UpdateContentRequest'];
type AdminContentPublishResponse = components['schemas']['AdminContentPublishResponse'];

/**
 * BFF 패턴: 클라이언트 → Next.js Route Handler → BE(API_BASE_URL)
 * 전역 api.ts의 handleClientError(404→/not-found redirect)를 우회하기 위해
 * fetch를 직접 사용. 인증은 Route Handler에서 쿠키로 처리.
 */
async function adminFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<{ ok: boolean; status: number; data: T | null }> {
  const res = await fetch(path, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  const json = await res.json().catch(() => null);
  return { ok: res.ok, status: res.status, data: json as T | null };
}

export const adminContentService = {
  async getContents(page = 1, size = 50): Promise<AdminContentListResponse> {
    const { data } = await adminFetch<ApiResponseAdminContentListResponse>(
      `/api/v1/admin/contents?page=${page}&size=${size}`,
    );
    return data?.data ?? { totalCount: 0, contents: [] };
  },

  async createContent(): Promise<AdminContentCreateResponse> {
    const { ok, data, status } = await adminFetch<ApiResponseAdminContentCreateResponse>(
      '/api/v1/admin/contents',
      { method: 'POST' },
    );
    if (!ok) {
      const msg = data?.message ?? `콘텐츠 생성에 실패했습니다. (${status})`;
      toastStore.show(msg);
      throw new Error(msg);
    }
    return data?.data ?? {};
  },

  async getContent(id: string): Promise<AdminContentDetailResponse> {
    const { data } = await adminFetch<ApiResponseAdminContentDetailResponse>(
      `/api/v1/admin/contents/${id}`,
    );
    return data?.data ?? {};
  },

  async updateContent(id: string, body: UpdateContentRequest): Promise<AdminContentDetailResponse> {
    const { ok, data, status } = await adminFetch<ApiResponseAdminContentDetailResponse>(
      `/api/v1/admin/contents/${id}`,
      { method: 'PATCH', body: JSON.stringify(body) },
    );
    if (!ok) {
      const msg = data?.message ?? `저장에 실패했습니다. (${status})`;
      toastStore.show(msg);
      throw new Error(msg);
    }
    return data?.data ?? {};
  },

  async publishContent(id: string, domains: string[]): Promise<AdminContentPublishResponse> {
    const { ok, data, status } = await adminFetch<ApiResponseAdminContentPublishResponse>(
      `/api/v1/admin/contents/${id}/publish`,
      { method: 'POST', body: JSON.stringify({ domains }) },
    );
    if (!ok) {
      const msg = data?.message ?? `게시에 실패했습니다. (${status})`;
      toastStore.show(msg);
      throw new Error(msg);
    }
    return data?.data ?? {};
  },

  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/v1/admin/contents/upload-image', {
      method: 'POST',
      body: formData,
    });
    const json = (await res.json().catch(() => ({}))) as ApiResponseAdminImageUploadResponse;
    return json.data?.imageUrl ?? '';
  },
};
