/**
 * 예약 상세 조회 Hook
 *
 * @see docs/sprints/sprint-2.md
 * @see docs/specifications/05-STATE-MANAGEMENT.md
 */

"use client";

import { ApiError } from "@/lib/api/errors";
import { reservationApi } from "@/lib/api/reservations";
import type { Reservation } from "@/types";
import { useQuery } from "@tanstack/react-query";

/**
 * 예약 상세 조회 Hook
 *
 * @param id - 예약 ID
 * @returns React Query result with reservation detail
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useReservationDetail(123);
 *
 * if (isLoading) return <LoadingSpinner />;
 * if (error) return <ErrorMessage />;
 * if (!data) return <NotFound />;
 *
 * return (
 *   <div>
 *     <h1>{data.campgroundName}</h1>
 *     <QRCode value={`RSV-${data.id}`} />
 *   </div>
 * );
 * ```
 */
export function useReservationDetail(id: number) {
  return useQuery<Reservation>({
    queryKey: ["reservation", id],
    queryFn: () => reservationApi.getById(id),
    enabled: !!id, // id가 있을 때만 쿼리 실행
    staleTime: 3 * 60 * 1000, // 3분
    gcTime: 10 * 60 * 1000, // 10분간 캐시 유지
    // ✅ 재시도 설정 추가
    retry: (failureCount, error) => {
      // 404, 403 같은 클라이언트 에러는 재시도 안 함
      if (error instanceof ApiError) {
        if (error.status >= 400 && error.status < 500) {
          return false;
        }
      }
      // 네트워크 에러나 서버 에러는 최대 2번 재시도
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
}
