import { adminApi } from "@/lib/api/admin";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * 캠핑장 승인 Hook
 */
export function useApproveCampground() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (campgroundId: number) =>
      adminApi.approveCampground(campgroundId),
    onSuccess: () => {
      // 캠핑장 목록 및 통계 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ["admin", "campgrounds"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });
}
