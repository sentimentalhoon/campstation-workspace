import { get } from "@/lib/api/client";
import { API_ENDPOINTS, APP_CONFIG } from "@/lib/constants";
import type { Campground } from "@/types/domain";
import { useQuery } from "@tanstack/react-query";

export function usePopularCampgrounds(
  limit: number = APP_CONFIG.DEFAULT_PAGE_SIZE
) {
  return useQuery({
    queryKey: ["campgrounds", "popular", limit],
    queryFn: async () => {
      // ✅ API 클라이언트가 CommonResponse.data를 unwrap하므로 response는 직접 Campground[]
      const response = await get<Campground[]>(
        API_ENDPOINTS.CAMPGROUNDS_EXT.POPULAR,
        {
          params: { limit },
        }
      );
      return response;
    },
    staleTime: 1000 * 60 * 5, // 5분
  });
}
