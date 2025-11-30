import { get } from "@/lib/api/client";
import { API_ENDPOINTS, APP_CONFIG } from "@/lib/constants";
import type { Review } from "@/types/domain";
import { useQuery } from "@tanstack/react-query";

export function useRecentReviews(limit: number = APP_CONFIG.DEFAULT_PAGE_SIZE) {
  return useQuery({
    queryKey: ["reviews", "recent", limit],
    queryFn: async () => {
      // ✅ API 클라이언트가 CommonResponse.data를 unwrap하므로 response는 직접 Review[]
      const response = await get<Review[]>(API_ENDPOINTS.REVIEWS.RECENT, {
        params: { limit },
      });
      return response;
    },
    staleTime: 1000 * 60 * 3, // 3분
  });
}
