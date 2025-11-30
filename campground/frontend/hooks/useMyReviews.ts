/**
 * 내 리뷰 목록 조회 Hook
 *
 * @see docs/sprints/sprint-3.md
 */

"use client";

import { reviewApi } from "@/lib/api/reviews";
import type { PageResponse, Review } from "@/types";
import { useQuery } from "@tanstack/react-query";

type UseMyReviewsParams = {
  page?: number;
  size?: number;
};

/**
 * 내가 작성한 리뷰 목록 조회 Hook
 *
 * @param params - 페이지네이션 파라미터
 * @returns React Query result with my reviews list
 *
 * @example
 * ```tsx
 * const { data, isLoading } = useMyReviews({ page: 0, size: 10 });
 *
 * if (isLoading) return <LoadingSpinner />;
 *
 * return (
 *   <div>
 *     {data?.data.content.map((review) => (
 *       <ReviewCard key={review.id} review={review} />
 *     ))}
 *   </div>
 * );
 * ```
 */
export function useMyReviews(params?: UseMyReviewsParams) {
  return useQuery<PageResponse<Review>>({
    queryKey: ["reviews", "my", params],
    queryFn: () => reviewApi.getMyReviews(params),
    staleTime: 1 * 60 * 1000, // 1분
    gcTime: 5 * 60 * 1000, // 5분
  });
}
