/**
 * 리뷰 작성 Hook
 */

import { reviewApi } from "@/lib/api";
import type { CreateReviewDto, CreateReviewResponse } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * 리뷰 작성 Hook
 *
 * @example
 * ```tsx
 * const { mutate, isPending } = useCreateReview();
 *
 * mutate({
 *   campgroundId: 1,
 *   reservationId: 123,
 *   rating: 5,
 *   comment: "좋았어요!",
 *   imageUrls: ["path1.jpg"]
 * });
 * ```
 */
export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation<CreateReviewResponse, Error, CreateReviewDto>({
    mutationFn: (data) => reviewApi.create(data),
    onSuccess: (_, variables) => {
      // 리뷰 목록 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: ["reviews", variables.campgroundId],
      });
      // 내 리뷰 목록 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: ["reviews", "my"],
      });
      // 예약 상세 캐시 무효화 (리뷰 작성 완료 상태 반영)
      if (variables.reservationId) {
        queryClient.invalidateQueries({
          queryKey: ["reservations", variables.reservationId],
        });
      }
      // 캠핑장 상세 캐시 무효화 (평점 업데이트)
      queryClient.invalidateQueries({
        queryKey: ["campgrounds", variables.campgroundId],
      });
    },
  });
}
