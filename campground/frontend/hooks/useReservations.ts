/**
 * 예약 목록 조회 Hook
 *
 * @see docs/sprints/sprint-2.md
 * @see docs/specifications/05-STATE-MANAGEMENT.md
 */

"use client";

import { reservationApi } from "@/lib/api/reservations";
import type {
  PageResponse,
  Reservation,
  ReservationSearchParams,
} from "@/types";
import { useQuery } from "@tanstack/react-query";

/**
 * 예약 목록 조회 Hook
 *
 * @param params - 검색 파라미터 (상태, 날짜 범위, 페이지 등)
 * @returns React Query result with reservations list
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useReservations({
 *   status: 'CONFIRMED',
 *   page: 0,
 *   size: 10,
 * });
 *
 * if (isLoading) return <LoadingSpinner />;
 * if (error) return <ErrorMessage />;
 *
 * return (
 *   <div>
 *     {data?.content.map((reservation) => (
 *       <ReservationCard key={reservation.id} data={reservation} />
 *     ))}
 *   </div>
 * );
 * ```
 */
export function useReservations(params?: ReservationSearchParams) {
  return useQuery<PageResponse<Reservation>>({
    queryKey: ["reservations", params],
    queryFn: () => reservationApi.getAll(params),
    staleTime: 1 * 60 * 1000, // 1분 (예약 정보는 자주 변경될 수 있음)
    gcTime: 5 * 60 * 1000, // 5분간 캐시 유지
  });
}
