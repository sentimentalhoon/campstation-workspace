/**
 * useCampgroundsByLocation Hook
 *
 * 좌표 기반 캠핑장 조회
 *
 * @see docs/sprints/sprint-5.md
 */

"use client";

import { campgroundApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

type UseCampgroundsByLocationParams = {
  lat?: number;
  lng?: number;
  radius?: number;
  enabled?: boolean;
};

/**
 * 좌표 기반 캠핑장 조회 Hook
 *
 * @param lat - 위도
 * @param lng - 경도
 * @param radius - 반경 (km)
 * @param enabled - 쿼리 활성화 여부
 */
export function useCampgroundsByLocation({
  lat,
  lng,
  radius = 10,
  enabled = true,
}: UseCampgroundsByLocationParams = {}) {
  return useQuery({
    queryKey: ["campgrounds-location", { lat, lng, radius }],
    queryFn: () =>
      campgroundApi.getAll({
        page: 0,
        size: 100,
        // TODO: 백엔드 API가 좌표 기반 검색을 지원하면 파라미터 추가
        // lat,
        // lng,
        // radius,
      }),
    enabled: enabled && !!lat && !!lng,
  });
}
