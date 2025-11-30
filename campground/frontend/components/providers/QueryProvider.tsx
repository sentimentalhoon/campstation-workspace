/**
 * React Query Provider
 * 서버 상태 관리를 위한 QueryClient 설정
 * @see docs/technical/caching-strategy.md
 */

"use client";

import { QUERY_CONFIG } from "@/lib/constants";
import { ApiError } from "@/lib/api/errors";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

type QueryProviderProps = {
  children: ReactNode;
};

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // 기본 캐싱 설정
            staleTime: QUERY_CONFIG.STALE_TIME.DEFAULT, // 1분
            gcTime: QUERY_CONFIG.GC_TIME.DEFAULT, // 5분 (구 cacheTime)

            // ✅ 재시도 설정 - 인증/권한 에러는 재시도 안 함 (무한루프 방지)
            retry: (failureCount, error) => {
              // 401 (Unauthorized), 403 (Forbidden)은 재시도 안 함
              // → 토큰 갱신은 client.ts에서 자동 처리되므로 React Query에서 재시도 불필요
              if (error instanceof ApiError) {
                const isAuthError = [401, 403].includes(error.status);
                if (isAuthError) return false;

                // 400번대 클라이언트 에러는 재시도 안 함 (요청 자체가 잘못됨)
                const isClientError = error.status >= 400 && error.status < 500;
                if (isClientError) return false;
              }

              // 500번대 서버 에러, 네트워크 에러만 최대 3번 재시도
              return failureCount < QUERY_CONFIG.RETRY;
            },
            retryDelay: (attemptIndex) =>
              // ✅ Exponential backoff: 1초 → 2초 → 4초
              Math.min(1000 * 2 ** attemptIndex, 30000),

            // 리페칭 설정
            refetchOnWindowFocus: false, // 기본적으로 포커스 시 재검증 비활성화 (각 hook에서 필요시 true로 설정)
            refetchOnReconnect: true, // 네트워크 재연결 시 재검증
            refetchOnMount: true, // 마운트 시 stale하면 재검증
          },
          mutations: {
            // 뮤테이션 재시도 설정 - 멱등성 보장 어려우므로 재시도 안 함
            retry: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
