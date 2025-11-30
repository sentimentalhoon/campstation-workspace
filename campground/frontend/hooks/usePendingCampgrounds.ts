import { adminApi } from "@/lib/api/admin";
import { useQuery } from "@tanstack/react-query";

/**
 * 승인 대기 캠핑장 목록 조회 Hook
 */
export function usePendingCampgrounds(params?: {
  page?: number;
  size?: number;
}) {
  return useQuery({
    queryKey: ["admin", "campgrounds", "pending", params],
    queryFn: () => adminApi.getPendingCampgrounds(params),
  });
}
