# API 통신 가이드

> CampStation API 클라이언트 설계 및 사용 가이드

## API 레이어 아키텍처

```
Page/Component
    ↓
Custom Hook (useQuery/useMutation)
    ↓
API Client (lib/api/)
    ↓
Base Client (fetch wrapper)
    ↓
Backend API (Spring Boot)
```

## Base API Client

### client.ts - 핵심 구현

```typescript
// lib/api/client.ts
import { API_BASE_URL } from "./config";
import { ApiError, NetworkError } from "./errors";
import type { ApiResponse } from "@/types/api/response";

/**
 * Base API client using native fetch
 *
 * @param endpoint - API endpoint (e.g., '/v1/users')
 * @param options - Fetch options
 * @returns Typed API response
 */
export async function apiClient<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      credentials: "include", // HttpOnly 쿠키 자동 포함
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      ...options,
    });

    // 에러 응답 처리
    if (!response.ok) {
      const errorData = await parseErrorResponse(response);
      throw new ApiError(response.status, errorData);
    }

    // 성공 응답
    const data = await response.json();
    return data;
  } catch (error) {
    // 네트워크 에러
    if (error instanceof TypeError) {
      throw new NetworkError("네트워크 연결을 확인해주세요");
    }

    // ApiError는 그대로 throw
    if (error instanceof ApiError) {
      throw error;
    }

    // 예상치 못한 에러
    throw new Error("알 수 없는 오류가 발생했습니다");
  }
}

/**
 * Parse error response from API
 */
async function parseErrorResponse(response: Response) {
  try {
    const data = await response.json();
    return {
      message: data.message || "요청 처리에 실패했습니다",
      errors: data.errors || {},
    };
  } catch {
    return {
      message: `HTTP ${response.status}: ${response.statusText}`,
      errors: {},
    };
  }
}
```

### errors.ts - 에러 클래스

```typescript
// lib/api/errors.ts

/**
 * API 에러
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    public data: {
      message: string;
      errors?: Record<string, string[]>;
    }
  ) {
    super(data.message);
    this.name = "ApiError";
  }

  /**
   * 특정 상태 코드 확인
   */
  is(status: number): boolean {
    return this.status === status;
  }

  /**
   * 인증 에러 여부
   */
  isAuthError(): boolean {
    return this.status === 401 || this.status === 403;
  }

  /**
   * 검증 에러 여부
   */
  isValidationError(): boolean {
    return this.status === 400 && !!this.data.errors;
  }
}

/**
 * 네트워크 에러
 */
export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NetworkError";
  }
}
```

### config.ts - 설정

```typescript
// lib/api/config.ts

const isBrowser = typeof window !== "undefined";

/**
 * API Base URL
 * - 브라우저: /api (Next.js proxy)
 * - 서버: 환경 변수에서 로드
 */
export const API_BASE_URL = (() => {
  if (isBrowser) {
    return process.env.NEXT_PUBLIC_API_URL || "/api";
  }

  // Server-side: Docker 내부 URL 우선
  return (
    process.env.INTERNAL_API_URL ||
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:8080/api"
  );
})();

/**
 * API 타임아웃 (ms)
 */
export const API_TIMEOUT = 30000; // 30초

/**
 * Retry 설정
 */
export const RETRY_CONFIG = {
  maxRetries: 2,
  retryDelay: 1000,
  retryableStatuses: [408, 429, 500, 502, 503, 504],
};
```

## Feature-specific API Modules

### auth.ts - 인증 API

```typescript
// lib/api/auth.ts
import { apiClient } from "./client";
import type { User, LoginCredentials, RegisterData } from "@/types/domain/user";
import type { ApiResponse, AuthResponse } from "@/types/api/response";

export const authApi = {
  /**
   * 로그인
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    return apiClient<AuthResponse>("/v1/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },

  /**
   * 회원가입
   */
  register: async (data: RegisterData): Promise<User> => {
    return apiClient<User>("/v1/auth/signup", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * 로그아웃
   */
  logout: async (): Promise<void> => {
    await apiClient<void>("/v1/auth/logout", {
      method: "POST",
    });
  },

  /**
   * 프로필 조회
   */
  getProfile: async (): Promise<ApiResponse<User>> => {
    return apiClient<User>("/v1/users/profile");
  },

  /**
   * 토큰 갱신
   */
  refreshToken: async (): Promise<boolean> => {
    try {
      await apiClient<void>("/v1/auth/refresh", {
        method: "POST",
      });
      return true;
    } catch {
      return false;
    }
  },
};
```

### campgrounds.ts - 캠핑장 API

```typescript
// lib/api/campgrounds.ts
import { apiClient } from "./client";
import type { Campground, CampgroundSearchParams } from "@/types/domain/campground";
import type { PaginatedResponse } from "@/types/api/response";

export const campgroundApi = {
  /**
   * 캠핑장 목록 조회
   */
  getAll: async (params?: CampgroundSearchParams): Promise<PaginatedResponse<Campground>> => {
    const queryString = new URLSearchParams(
      params as Record<string, string>
    ).toString();

    return apiClient<PaginatedResponse<Campground>>(
      `/v1/campgrounds${queryString ? `?${queryString}` : ""}`
    );
  },

  /**
   * 캠핑장 상세 조회
   */
  getById: async (id: number): Promise<Campground> => {
    return apiClient<Campground>(`/v1/campgrounds/${id}`);
  },

  /**
   * 인기 캠핑장 조회
   */
  getPopular: async (limit = 10): Promise<Campground[]> => {
    return apiClient<Campground[]>(`/v1/campgrounds/popular?limit=${limit}`);
  },

  /**
   * 캠핑장 검색
   */
  search: async (query: string): Promise<Campground[]> => {
    return apiClient<Campground[]>(
      `/v1/campgrounds/search?q=${encodeURIComponent(query)}`
    );
  },

  /**
   * 캠핑장 생성 (Owner only)
   */
  create: async (data: CreateCampgroundDto): Promise<Campground> => {
    return apiClient<Campground>("/v1/campgrounds", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * 캠핑장 수정 (Owner only)
   */
  update: async (id: number, data: UpdateCampgroundDto): Promise<Campground> => {
    return apiClient<Campground>(`/v1/campgrounds/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  /**
   * 캠핑장 삭제 (Owner only)
   */
  delete: async (id: number): Promise<void> => {
    await apiClient<void>(`/v1/campgrounds/${id}`, {
      method: "DELETE",
    });
  },
};
```

### reservations.ts - 예약 API

```typescript
// lib/api/reservations.ts
import { apiClient } from "./client";
import type { Reservation, CreateReservationDto } from "@/types/domain/reservation";
import type { PaginatedResponse } from "@/types/api/response";

export const reservationApi = {
  /**
   * 내 예약 목록 조회
   */
  getUserReservations: async (): Promise<PaginatedResponse<Reservation>> => {
    return apiClient<PaginatedResponse<Reservation>>("/v1/reservations");
  },

  /**
   * 예약 상세 조회
   */
  getById: async (id: number): Promise<Reservation> => {
    return apiClient<Reservation>(`/v1/reservations/${id}`);
  },

  /**
   * 예약 생성
   */
  create: async (data: CreateReservationDto): Promise<Reservation> => {
    return apiClient<Reservation>("/v1/reservations", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * 예약 취소
   */
  cancel: async (id: number): Promise<void> => {
    await apiClient<void>(`/v1/reservations/${id}/cancel`, {
      method: "POST",
    });
  },

  /**
   * 비회원 예약 조회
   */
  getByGuestInfo: async (reservationId: string, email: string): Promise<Reservation> => {
    return apiClient<Reservation>(
      `/v1/reservations/guest?id=${reservationId}&email=${encodeURIComponent(email)}`
    );
  },

  /**
   * 예약 가능한 날짜 조회
   */
  getAvailableDates: async (campgroundId: number): Promise<string[]> => {
    return apiClient<string[]>(`/v1/reservations/campgrounds/${campgroundId}/available-dates`);
  },
};
```

## React Query Integration

### Query Client 설정

```typescript
// lib/query/client.ts
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1분
      gcTime: 5 * 60 * 1000, // 5분 (v5: cacheTime → gcTime)
      retry: (failureCount, error) => {
        // ApiError의 경우 retry 하지 않음
        if (error instanceof ApiError) {
          return false;
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
```

### Custom Hooks

```typescript
// hooks/features/useCampgrounds.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { campgroundApi } from "@/lib/api/campgrounds";
import type { CampgroundSearchParams } from "@/types/domain/campground";

/**
 * 캠핑장 목록 조회 Hook
 */
export function useCampgrounds(params?: CampgroundSearchParams) {
  return useQuery({
    queryKey: ["campgrounds", params],
    queryFn: () => campgroundApi.getAll(params),
  });
}

/**
 * 캠핑장 상세 조회 Hook
 */
export function useCampground(id: number) {
  return useQuery({
    queryKey: ["campground", id],
    queryFn: () => campgroundApi.getById(id),
    enabled: !!id, // id가 있을 때만 실행
  });
}

/**
 * 캠핑장 생성 Mutation Hook
 */
export function useCreateCampground() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: campgroundApi.create,
    onSuccess: () => {
      // 캠핑장 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ["campgrounds"] });
    },
  });
}

/**
 * 캠핑장 수정 Mutation Hook
 */
export function useUpdateCampground() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCampgroundDto }) =>
      campgroundApi.update(id, data),
    onSuccess: (_, variables) => {
      // 특정 캠핑장 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ["campground", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["campgrounds"] });
    },
  });
}
```

### Optimistic Updates with React 19

```typescript
// hooks/features/useReservations.ts
import { useOptimistic, useTransition } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reservationApi } from "@/lib/api/reservations";

export function useReservations() {
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();

  // Query
  const { data, isLoading, error } = useQuery({
    queryKey: ["reservations"],
    queryFn: reservationApi.getUserReservations,
  });

  // Optimistic state
  const [optimisticReservations, updateOptimistic] = useOptimistic(
    data?.content || [],
    (state, deletedId: number) => state.filter((r) => r.id !== deletedId)
  );

  // Mutation
  const cancelMutation = useMutation({
    mutationFn: reservationApi.cancel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
    },
  });

  // Cancel with optimistic update
  const cancelReservation = async (id: number) => {
    updateOptimistic(id); // 즉시 UI 업데이트

    try {
      await cancelMutation.mutateAsync(id);
    } catch (error) {
      // 실패 시 자동 롤백
      console.error("Failed to cancel:", error);
    }
  };

  return {
    reservations: optimisticReservations,
    isLoading,
    error,
    cancelReservation,
    isPending,
  };
}
```

## Server-Side Data Fetching

### Server Component에서 직접 호출

```typescript
// app/campgrounds/page.tsx
import { campgroundApi } from "@/lib/api/campgrounds";
import { CampgroundList } from "@/components/features/campground/CampgroundList";

export default async function CampgroundsPage() {
  // Server에서 직접 API 호출
  const data = await campgroundApi.getAll();

  return (
    <div>
      <h1>캠핑장 목록</h1>
      <CampgroundList campgrounds={data.content} />
    </div>
  );
}
```

### Server Component + Client Component 조합

```typescript
// app/campgrounds/[id]/page.tsx - Server
import { campgroundApi } from "@/lib/api/campgrounds";
import { CampgroundDetailClient } from "./CampgroundDetailClient";

export default async function CampgroundDetailPage({ params }: Props) {
  const campground = await campgroundApi.getById(parseInt(params.id));

  return <CampgroundDetailClient initialData={campground} />;
}

// app/campgrounds/[id]/CampgroundDetailClient.tsx - Client
"use client";

import { useCampground } from "@/hooks/features/useCampgrounds";
import type { Campground } from "@/types/domain/campground";

export function CampgroundDetailClient({ initialData }: { initialData: Campground }) {
  // Client에서 React Query 사용 (initialData로 초기화)
  const { data, isLoading } = useCampground(initialData.id);

  const campground = data || initialData;

  return <div>{/* ... */}</div>;
}
```

## 에러 처리

### Component-level Error Handling

```typescript
"use client";

import { useCampgrounds } from "@/hooks/features/useCampgrounds";
import { ApiError } from "@/lib/api/errors";
import { ErrorMessage } from "@/components/ui/ErrorMessage";

export function CampgroundList() {
  const { data, error, isLoading } = useCampgrounds();

  if (isLoading) return <LoadingSpinner />;

  if (error) {
    if (error instanceof ApiError) {
      if (error.isAuthError()) {
        return <ErrorMessage>로그인이 필요합니다</ErrorMessage>;
      }

      if (error.isValidationError()) {
        return <ErrorMessage>입력값을 확인해주세요</ErrorMessage>;
      }
    }

    return <ErrorMessage>데이터를 불러올 수 없습니다</ErrorMessage>;
  }

  return <List items={data.content} />;
}
```

## 베스트 프랙티스

### 1. API 함수는 lib/api/에만

```typescript
// ✅ Good
import { campgroundApi } from "@/lib/api/campgrounds";
const data = await campgroundApi.getAll();

// ❌ Bad - 컴포넌트에서 직접 fetch
const response = await fetch("/api/campgrounds");
```

### 2. 타입 안전성

```typescript
// ✅ Good - Generic으로 타입 지정
const data = await apiClient<Campground[]>("/v1/campgrounds");
// data는 자동으로 Campground[] 타입

// ❌ Bad - 타입 없음
const data = await apiClient("/v1/campgrounds");
```

### 3. 에러 처리

```typescript
// ✅ Good - try/catch with specific error types
try {
  await campgroundApi.create(data);
} catch (error) {
  if (error instanceof ApiError) {
    if (error.isValidationError()) {
      // 검증 에러 처리
    }
  }
}

// ❌ Bad - 에러 무시
await campgroundApi.create(data).catch(() => {});
```

### 4. React Query 캐시 활용

```typescript
// ✅ Good - queryKey로 캐시 관리
const { data } = useQuery({
  queryKey: ["campground", id],
  queryFn: () => campgroundApi.getById(id),
});

// ✅ Good - Mutation 후 캐시 무효화
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ["campgrounds"] });
}
```

### 5. Loading & Error 상태 처리

```typescript
// ✅ Good - 모든 상태 처리
const { data, isLoading, error } = useQuery(...);

if (isLoading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
if (!data) return <EmptyState />;

return <List items={data} />;
```

## 요약

1. **단일 Base Client**: `apiClient` 함수로 모든 API 호출
2. **Feature별 분리**: `lib/api/` 폴더에 기능별 API 모듈
3. **타입 안전성**: Generic으로 응답 타입 지정
4. **React Query**: 서버 상태 관리, 캐싱, 재검증
5. **에러 처리**: ApiError 클래스로 체계적 처리
6. **Server/Client 분리**: Server Component는 직접 호출, Client는 Hook 사용
