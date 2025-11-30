/**
 * 리뷰 좋아요 Hook
 */

import { reviewApi } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useLikeReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      reviewId,
      isLiked,
    }: {
      reviewId: number;
      isLiked: boolean;
    }) => {
      if (isLiked) {
        await reviewApi.unlike(reviewId);
      } else {
        await reviewApi.like(reviewId);
      }
    },
    onSuccess: () => {
      // 리뷰 목록 및 상세 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
    onError: () => {
      // 에러 발생 시에도 캐시 무효화 (409/404 에러 시 서버 상태와 동기화)
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
  });
}
