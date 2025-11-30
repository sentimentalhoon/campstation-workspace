"use client";

import { campgroundApi } from "@/lib/api/campgrounds";
import type { Campground } from "@/types";
import { useQuery } from "@tanstack/react-query";

/**
 * 캠핑장 상세 정보 조회 Hook
 *
 * @param id - 캠핑장 ID
 * @returns React Query result with campground detail
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useCampgroundDetail(1);
 *
 * if (isLoading) return <LoadingSpinner />;
 * if (error) return <ErrorMessage message={error.message} />;
 * if (!data) return null;
 *
 * return <div>{data.name}</div>;
 * ```
 *
 * @see docs/technical/04-API-GUIDE.md
 * @see docs/technical/05-STATE-MANAGEMENT.md
 */
export function useCampgroundDetail(id: number) {
  return useQuery<Campground>({
    queryKey: ["campground", id],
    queryFn: () => campgroundApi.getById(id),
    enabled: !!id, // id가 있을 때만 쿼리 실행
    staleTime: 5 * 60 * 1000, // 5분간 fresh 상태 유지
    gcTime: 10 * 60 * 1000, // 10분간 캐시 유지 (구 cacheTime)
  });
}

/**
 * 캠핑장 사이트 목록 조회 Hook
 *
 * @param campgroundId - 캠핑장 ID
 * @returns React Query result with sites list
 */
export function useCampgroundSites(campgroundId: number) {
  return useQuery({
    queryKey: ["campground", campgroundId, "sites"],
    queryFn: () => campgroundApi.getSites(campgroundId),
    enabled: !!campgroundId,
    staleTime: 3 * 60 * 1000, // 3분 (사이트 예약 가능 여부는 더 자주 갱신)
  });
}
