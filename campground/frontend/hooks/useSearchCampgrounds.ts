/**
 * 캠핑장 검색 Hook
 */

import { campgroundApi } from "@/lib/api";
import type { Campground, CampgroundSearchParams, PageResponse } from "@/types";
import { useQuery } from "@tanstack/react-query";

/**
 * 캠핑장 검색 Hook
 *
 * @example
 * ```tsx
 * const { data, isLoading } = useSearchCampgrounds({
 *   keyword: "서울",
 *   minPrice: 20000,
 *   maxPrice: 100000,
 *   page: 0,
 *   size: 10
 * });
 * ```
 */
export function useSearchCampgrounds(params?: CampgroundSearchParams) {
  return useQuery<PageResponse<Campground>, Error>({
    queryKey: ["campgrounds", "search", params],
    queryFn: () => campgroundApi.search(params),
    enabled: true, // 항상 실행 (빈 검색도 허용)
    staleTime: 10 * 60 * 1000, // 10분 - 캠핑장 목록은 자주 변경되지 않음
    gcTime: 15 * 60 * 1000, // 15분 - 뒤로가기 시 캐시 활용
    refetchOnWindowFocus: false, // 포커스 시 재검증 불필요 (정적 데이터)
  });
}
