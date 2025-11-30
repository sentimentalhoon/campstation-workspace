/**
 * Base API Client
 * Native fetch 기반의 타입 안전한 API 클라이언트
 * HttpOnly Cookie 기반 인증 사용
 */

import type { ErrorResponse } from "@/types";
import { API_CONFIG } from "./config";
import { ApiError, NetworkError, TimeoutError } from "./errors";

/**
 * 토큰 갱신 Promise 캐싱 (동시 다발적 401 에러 시 1번만 갱신)
 * @internal
 */
let refreshTokenPromise: Promise<Response> | null = null;

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  headers?: Record<string, string>;
  body?: unknown;
  params?: Record<string, unknown>;
  timeout?: number;
  signal?: AbortSignal;
  /** @internal 토큰 갱신 후 재시도 여부 (내부용, 무한루프 방지) */
  _isRetry?: boolean;
};

/**
 * Base API client using native fetch
 *
 * @param endpoint - API endpoint (e.g., '/v1/users')
 * @param options - Request options
 * @returns Typed API response
 */
export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    method = "GET",
    headers = {},
    body,
    params,
    timeout = API_CONFIG.TIMEOUT,
    signal,
  } = options;

  // URL 생성
  const url = new URL(`${API_CONFIG.BASE_URL}${endpoint}`);

  // Query parameters 추가
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        // 배열인 경우 반복 추가
        if (Array.isArray(value)) {
          value.forEach((item) => url.searchParams.append(key, String(item)));
        } else {
          url.searchParams.append(key, String(value));
        }
      }
    });
  }

  // Timeout 처리를 위한 AbortController
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  // FormData 체크 (재시도 로직에서도 사용하므로 try 블록 밖에 선언)
  const isFormData = body instanceof FormData;

  try {
    // ✅ HttpOnly 쿠키가 자동으로 전송됨 (credentials: "include")
    const response = await fetch(url.toString(), {
      method,
      credentials: "include", // HttpOnly 쿠키 자동 포함
      headers: isFormData
        ? {
            // FormData는 Content-Type을 설정하지 않음 (브라우저가 자동으로 boundary 포함)
            ...headers,
          }
        : {
            "Content-Type": "application/json",
            ...headers,
          },
      body: isFormData ? body : body ? JSON.stringify(body) : undefined,
      signal: signal || controller.signal,
    });

    clearTimeout(timeoutId);

    // 에러 응답 처리
    if (!response.ok) {
      const errorData = await parseErrorResponse(response);
      throw new ApiError(response.status, errorData);
    }

    // 204 No Content인 경우
    if (response.status === 204) {
      return undefined as T;
    }

    // 성공 응답
    const data = await response.json();

    // CommonResponse 형식 unwrap
    // 백엔드가 { success: true, message: "...", data: T } 형식으로 응답
    if (data && typeof data === "object" && "data" in data) {
      return data.data as T;
    }

    return data as T;
  } catch (error) {
    clearTimeout(timeoutId);

    // AbortError (Timeout)
    if (error instanceof Error && error.name === "AbortError") {
      throw new TimeoutError();
    }

    // Network Error
    if (error instanceof TypeError) {
      throw new NetworkError();
    }

    // ApiError - 401 에러 시 토큰 갱신 시도
    if (error instanceof ApiError) {
      // ✅ 조건: 401 에러 && /auth/refresh가 아님 && /auth/me가 아님 && 이미 재시도한 요청이 아님
      // ⚠️ /auth/me는 초기 인증 상태 확인용이므로 401이 정상 응답일 수 있음 (비로그인 상태)
      const shouldRefreshToken =
        error.status === 401 &&
        !url.pathname.includes("/auth/refresh") &&
        !url.pathname.includes("/auth/me") &&
        !options._isRetry;

      if (shouldRefreshToken) {
        try {
          // ✅ Promise 캐싱: 동시 다발적 401 에러 시 토큰 갱신은 1번만 수행
          if (!refreshTokenPromise) {
            refreshTokenPromise = fetch(
              `${API_CONFIG.BASE_URL}/v1/auth/refresh`,
              {
                method: "POST",
                credentials: "include", // refreshToken 쿠키 전송
                headers: {
                  "Content-Type": "application/json",
                },
              }
            ).finally(() => {
              // 완료/실패 후 Promise 캐시 초기화 (다음 갱신을 위해)
              refreshTokenPromise = null;
            });
          }

          // 캐시된 Promise를 재사용 (여러 요청이 동시에 401 받아도 갱신은 1번만)
          const refreshResponse = await refreshTokenPromise;

          if (!refreshResponse.ok) {
            // Refresh Token도 만료됨 → 로그인 페이지로
            // ⚠️ 예외: /reservations 페이지는 비회원도 접근 가능
            if (typeof window !== "undefined") {
              const currentPath = window.location.pathname;
              if (!currentPath.startsWith("/reservations")) {
                window.location.href = "/login";
              }
            }
            throw error;
          }

          // ✅ 토큰 갱신 성공 → 원래 요청 재시도 (단 1회, _isRetry 플래그로 무한루프 방지)
          return apiClient<T>(endpoint, {
            ...options,
            _isRetry: true, // 재시도 플래그 설정
          });
        } catch (refreshError) {
          // ✅ 갱신은 성공했지만 재시도가 실패한 경우
          if (refreshError instanceof ApiError) {
            // 재시도에서 발생한 에러는 그대로 throw (로그인 리다이렉트 안 함)
            throw refreshError;
          }

          // 네트워크 에러 등 예상치 못한 에러 → 로그인 페이지로
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
          throw error;
        }
      }

      throw error;
    }

    // 예상치 못한 에러
    throw new Error("알 수 없는 오류가 발생했습니다");
  }
}

/**
 * Parse error response from API
 */
async function parseErrorResponse(
  response: Response
): Promise<{ message: string; errors?: Record<string, string[]> }> {
  try {
    const data: ErrorResponse = await response.json();
    return {
      message: data.message || "요청 처리에 실패했습니다",
      errors: data.errors,
    };
  } catch {
    return {
      message: `HTTP ${response.status}: ${response.statusText}`,
    };
  }
}

/**
 * GET 요청 헬퍼
 */
export function get<T>(
  endpoint: string,
  options?: Omit<RequestOptions, "method" | "body">
) {
  return apiClient<T>(endpoint, { ...options, method: "GET" });
}

/**
 * POST 요청 헬퍼
 */
export function post<T>(
  endpoint: string,
  body?: unknown,
  options?: Omit<RequestOptions, "method" | "body">
) {
  return apiClient<T>(endpoint, { ...options, method: "POST", body });
}

/**
 * PUT 요청 헬퍼
 */
export function put<T>(
  endpoint: string,
  body?: unknown,
  options?: Omit<RequestOptions, "method" | "body">
) {
  return apiClient<T>(endpoint, { ...options, method: "PUT", body });
}

/**
 * PATCH 요청 헬퍼
 */
export function patch<T>(
  endpoint: string,
  body?: unknown,
  options?: Omit<RequestOptions, "method" | "body">
) {
  return apiClient<T>(endpoint, { ...options, method: "PATCH", body });
}

/**
 * DELETE 요청 헬퍼
 */
export function del<T>(
  endpoint: string,
  options?: Omit<RequestOptions, "method" | "body">
) {
  return apiClient<T>(endpoint, { ...options, method: "DELETE" });
}
