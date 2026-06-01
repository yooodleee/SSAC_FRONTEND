import { env } from '@/lib/env';
import { getErrorMessage } from '@/lib/errorMessages';
import { toastStore } from '@/lib/toastStore';
import { authStore } from '@/lib/authStore';
import type { UserContext } from '@/lib/authStore';
import type { ApiError, ErrorResponse } from '@/types';

// ============================================================
// Core fetch wrapper
// ============================================================

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: Record<string, unknown> | FormData;
  params?: Record<string, string | number | boolean>;
}

// 동시 다중 reissue 호출 방지 뮤텍스
// 진행 중인 재발급 요청이 있으면 동일 Promise를 공유하고, 완료 후 초기화
let _reissueInflight: Promise<boolean> | null = null;

async function tryRefreshToken(): Promise<boolean> {
  if (_reissueInflight) return _reissueInflight;

  _reissueInflight = fetch('/api/v1/auth/reissue', { method: 'POST' })
    .then(async (res) => {
      if (!res.ok) return false;
      try {
        // BFF가 ReissueResponse를 unwrap해서 반환 → { accessToken, userId, nickname, ... }
        // authStore를 갱신해 useCurrentUser 등이 최신 컨텍스트를 즉시 참조하도록 함
        const data = (await res.json()) as UserContext;
        if (data?.userId) {
          authStore.set(data);
        }
      } catch {
        // 파싱 실패해도 BFF가 이미 accessToken 쿠키를 갱신했으므로 true 반환
      }
      return true;
    })
    .catch(() => false)
    .finally(() => {
      _reissueInflight = null;
    });

  return _reissueInflight;
}

function redirectToLogin(currentPath: string): void {
  window.location.href = `/login?redirectTo=${encodeURIComponent(currentPath)}`;
}

function buildApiError(data: Partial<ErrorResponse>, status: number): ApiError {
  return {
    status,
    code: data.code,
    message: data.message ?? `HTTP ${status}`,
    errors: data.errors,
  };
}

/**
 * 클라이언트 전용: HTTP 상태 코드별 toast / redirect 사이드이펙트 처리.
 * AUTH-002(토큰 만료) 재시도 로직은 request()에서 별도 처리.
 */
function handleClientError(status: number, data: Partial<ErrorResponse>): void {
  const message = getErrorMessage(data.code, data.message);
  const currentPath = window.location.pathname + window.location.search;

  switch (status) {
    case 400:
      // errors 배열이 있으면 form 컴포넌트가 필드별로 처리 → toast 생략
      if (!data.errors?.length) toastStore.show(message);
      break;

    case 401:
      if (data.code === 'AUTH-003') {
        // 유효하지 않은 토큰 → 토스트 없이 즉시 리다이렉트
        redirectToLogin(currentPath);
      } else {
        // AUTH-001 또는 기타 401
        toastStore.show(getErrorMessage('AUTH-001'));
        redirectToLogin(currentPath);
      }
      break;

    case 403:
      window.location.href = '/forbidden';
      break;

    case 404:
      // Next.js App Router: 실제 라우트가 없는 경로로 이동하면 not-found.tsx 렌더링
      window.location.href = '/not-found';
      break;

    case 409:
      toastStore.show(message);
      break;

    case 500:
      toastStore.show(getErrorMessage('SERVER-001'));
      break;

    default:
      toastStore.show(message);
      break;
  }
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {},
  _retried = false,
): Promise<T> {
  const { body, params, headers, ...rest } = options;

  // Build query string
  const url = new URL(`${env.apiBaseUrl}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, String(value));
    });
  }

  const isFormData = body instanceof FormData;

  const fetchOptions: RequestInit = {
    ...rest,
    credentials: 'include', // accessToken 쿠키 전송
    headers: {
      ...(!isFormData && { 'Content-Type': 'application/json' }),
      ...headers,
    },
    ...(body !== undefined && {
      body: isFormData ? body : JSON.stringify(body),
    }),
  };

  const response = await fetch(url.toString(), fetchOptions);

  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as Partial<ErrorResponse>;
    const { status } = response;

    if (typeof window !== 'undefined') {
      // AUTH-002(토큰 만료): Refresh Token으로 재발급 후 원래 요청 재시도
      if (status === 401 && !_retried && data.code === 'AUTH-002') {
        const refreshed = await tryRefreshToken();
        if (refreshed) return request<T>(endpoint, options, true);
        // 재발급 실패 → 세션 만료 안내 후 로그인 리다이렉트
        toastStore.show(getErrorMessage('AUTH-002'));
        redirectToLogin(window.location.pathname + window.location.search);
      } else {
        handleClientError(status, data);
      }
    }

    throw buildApiError(data, status);
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
