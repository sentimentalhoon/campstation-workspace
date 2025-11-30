/**
 * API 공통 타입
 */

/**
 * 표준 API 응답
 */
export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
};

/**
 * 페이지네이션 응답
 */
export type PageResponse<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
};

/**
 * 에러 응답
 */
export type ErrorResponse = {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
  timestamp: string;
  path?: string;
};

/**
 * 페이지네이션 파라미터
 */
export type PaginationParams = {
  page?: number;
  size?: number;
  sortBy?: string;
  order?: "asc" | "desc";
};

/**
 * HTTP 메서드
 */
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

/**
 * API 요청 옵션
 */
export type ApiRequestOptions = {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
  signal?: AbortSignal;
};
