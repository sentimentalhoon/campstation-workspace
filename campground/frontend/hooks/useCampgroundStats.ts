/**
 * 캠핑장 통계 조회 훅
 *
 * @module hooks/useCampgroundStats
 * @description 캠핑장의 조회수, 방문자, 예약 전환율 등의 통계를 조회합니다.
 */

"use client";

import { statsApi } from "@/lib/api";
import type { CampgroundStats, StatsQueryParams } from "@/types";
import { useQuery } from "@tanstack/react-query";

/**
 * 캠핑장 통계 조회 훅
 *
 * Owner Dashboard에서 캠핑장의 통계 데이터를 조회합니다.
 * React Query를 사용하여 자동 캐싱 및 갱신을 처리합니다.
 *
 * @param campgroundId - 캠핑장 ID
 * @param params - 통계 조회 파라미터 (days, startDate, endDate)
 * @param params.days - 최근 N일 (기본값: 30)
 * @param params.startDate - 시작 날짜 (YYYY-MM-DD)
 * @param params.endDate - 종료 날짜 (YYYY-MM-DD)
 * @returns React Query 결과 객체
 *
 * @example
 * ```tsx
 * function CampgroundStatsSection({ campgroundId }: Props) {
 *   const { data, isLoading, error } = useCampgroundStats(campgroundId, { days: 30 });
 *
 *   if (isLoading) return <LoadingSpinner />;
 *   if (error) return <ErrorMessage message="통계를 불러올 수 없습니다" />;
 *
 *   return (
 *     <div>
 *       <h3>최근 30일 통계</h3>
 *       <p>총 방문자: {data.totalUniqueVisitors}명</p>
 *       <p>총 조회수: {data.totalViews}회</p>
 *       <p>전환율: {data.conversionRate.toFixed(2)}%</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useCampgroundStats(
  campgroundId: number,
  params: StatsQueryParams = { days: 30 }
) {
  return useQuery<CampgroundStats>({
    queryKey: ["campgroundStats", campgroundId, params],
    queryFn: () => statsApi.getStats(campgroundId, params),
    staleTime: 5 * 60 * 1000, // 5분 (통계는 실시간성이 덜 중요)
    gcTime: 10 * 60 * 1000, // 10분
    enabled: !!campgroundId, // campgroundId가 있을 때만 실행
  });
}

/**
 * 실시간 조회수 조회 훅
 *
 * 캠핑장의 실시간 조회수를 조회합니다. (24시간, 7일, 30일)
 *
 * @param campgroundId - 캠핑장 ID
 * @param period - 조회 기간 ("24h", "7d", "30d")
 * @returns React Query 결과 객체
 *
 * @example
 * ```tsx
 * function ViewCountBadge({ campgroundId }: Props) {
 *   const { data } = useViewCount(campgroundId, "24h");
 *
 *   return <span>조회수: {data?.viewCount || 0}회</span>;
 * }
 * ```
 */
export function useViewCount(
  campgroundId: number,
  period: "24h" | "7d" | "30d" = "24h"
) {
  return useQuery({
    queryKey: ["viewCount", campgroundId, period],
    queryFn: () => statsApi.getViewCount(campgroundId, period),
    staleTime: 1 * 60 * 1000, // 1분 (조회수는 자주 갱신)
    gcTime: 5 * 60 * 1000, // 5분
    enabled: !!campgroundId,
  });
}
