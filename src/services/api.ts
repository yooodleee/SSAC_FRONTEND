import { env } from '@/lib/env';
import type { ApiError } from '@/types';

// ============================================================
// Core fetch wrapper
// ============================================================

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: Record<string, unknown> | FormData;
  params?: Record<string, string | number | boolean>;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { body, params, headers, ...rest } = options;

  // Build query string
  const url = new URL(`${env.apiBaseUrl}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, String(value));
    });
  }

  const isFormData = body instanceof FormData;

  const response = await fetch(url.toString(), {
    ...rest,
    headers: {
      ...(!isFormData && { 'Content-Type': 'application/json' }),
      ...headers,
    },
    ...(body !== undefined && {
      body: isFormData ? body : JSON.stringify(body),
    }),
  });

  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({}))) as Partial<ApiError>;
    const error: ApiError = {
      message: errorData.message ?? `HTTP ${response.status}: ${response.statusText}`,
      status: response.status,
      errors: errorData.errors,
    };
    throw error;
  }

  // Handle 204 No Content
  if (response.status === 204) return undefined as T;

  return response.json() as Promise<T>;
}

// ============================================================
// HTTP helpers
// ============================================================

type GetOptions = Pick<RequestOptions, 'params' | 'headers'>;
type MutationOptions = Pick<RequestOptions, 'headers'>;

export const apiClient = {
  get<T>(endpoint: string, options?: GetOptions): Promise<T> {
    return request<T>(endpoint, { method: 'GET', ...options });
  },

  post<T>(endpoint: string, body?: Record<string, unknown>, options?: MutationOptions): Promise<T> {
    return request<T>(endpoint, { method: 'POST', body, ...options });
  },

  put<T>(endpoint: string, body?: Record<string, unknown>, options?: MutationOptions): Promise<T> {
    return request<T>(endpoint, { method: 'PUT', body, ...options });
  },

  patch<T>(
    endpoint: string,
    body?: Record<string, unknown>,
    options?: MutationOptions,
  ): Promise<T> {
    return request<T>(endpoint, { method: 'PATCH', body, ...options });
  },

  delete<T>(endpoint: string, options?: MutationOptions): Promise<T> {
    return request<T>(endpoint, { method: 'DELETE', ...options });
  },
};
