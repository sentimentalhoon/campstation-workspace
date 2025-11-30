import { adminApi } from "@/lib/api/admin";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * 캠핑장 거부 Hook
 */
export function useRejectCampground() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      campgroundId,
      reason,
    }: {
      campgroundId: number;
      reason: string;
    }) => adminApi.rejectCampground(campgroundId, reason),
    onSuccess: () => {
      // 캠핑장 목록 및 통계 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ["admin", "campgrounds"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });
}
