/**
 * 리뷰 신고 Hook
 */

import { reviewApi } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";

export function useReportReview() {
  return useMutation({
    mutationFn: async ({
      reviewId,
      reason,
    }: {
      reviewId: number;
      reason: string;
    }) => {
      await reviewApi.report(reviewId, { reason });
    },
  });
}
