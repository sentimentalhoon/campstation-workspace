import { get } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/constants";
import { PageResponse, Site } from "@/types";
import { useQuery } from "@tanstack/react-query";

/**
 * 캠핑장의 사이트 목록 조회
 */
export function useSites(
  campgroundId: number,
  page: number = 0,
  size: number = 50
) {
  return useQuery({
    queryKey: ["sites", campgroundId, page, size],
    queryFn: async () => {
      // ✅ API 클라이언트가 CommonResponse.data를 unwrap하므로 response는 직접 PageResponse<Site>
      const response = await get<PageResponse<Site>>(
        API_ENDPOINTS.CAMPGROUNDS.SITES(campgroundId),
        {
          params: { page, size },
          skipAuthRefresh: true,
        }
      );
      return response;
    },
    staleTime: 1000 * 60 * 5, // 5분
  });
}
