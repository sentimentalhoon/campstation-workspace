/**
 * 리뷰 수정 Hook
 */

import { reviewApi } from "@/lib/api";
import type { UpdateReviewDto, UpdateReviewResponse } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type UpdateReviewVariables = {
  reviewId: number;
  data: UpdateReviewDto;
};

/**
 * 리뷰 수정 Hook
 *
 * @example
 * ```tsx
 * const { mutate, isPending } = useUpdateReview();
 *
 * mutate({
 *   reviewId: 1,
 *   data: {
 *     rating: 4,
 *     comment: "수정된 내용",
 *     imageUrls: ["path1.jpg"]
 *   }
 * });
 * ```
 */
export function useUpdateReview() {
  const queryClient = useQueryClient();

  return useMutation<UpdateReviewResponse, Error, UpdateReviewVariables>({
    mutationFn: ({ reviewId, data }) => reviewApi.update(reviewId, data),
    onSuccess: (response) => {
      const review = response.data;

      // 리뷰 목록 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: ["reviews", review.campgroundId],
      });
      // 내 리뷰 목록 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: ["reviews", "my"],
      });
      // 캠핑장 상세 캐시 무효화 (평점 업데이트)
      queryClient.invalidateQueries({
        queryKey: ["campgrounds", review.campgroundId],
      });
    },
  });
}
