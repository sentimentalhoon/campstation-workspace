/**
 * 리뷰 목록 조회 Hook
 *
 * @module hooks/useReviews
 * @description 특정 캠핑장의 리뷰 목록을 조회하는 React Query 기반 Hook
 */

import { reviewApi } from "@/lib/api/reviews";
import type { ReviewSearchParams } from "@/types";
import { useQuery } from "@tanstack/react-query";

/**
 * 캠핑장 리뷰 목록 조회
 *
 * @param campgroundId - 캠핑장 ID
 * @param params - 검색 파라미터 (페이징, 정렬 등)
 * @returns React Query result with reviews list
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useReviews(1, {
 *   page: 0,
 *   size: 10,
 *   sortBy: 'createdAt',
 *   order: 'desc'
 * });
 *
 * if (isLoading) return <LoadingSpinner />;
 * if (error) return <ErrorMessage error={error} />;
 *
 * return (
 *   <div>
 *     {data?.content.map((review) => (
 *       <ReviewCard key={review.id} review={review} />
 *     ))}
 *   </div>
 * );
 * ```
 *
 * @see {@link https://github.com/sentimentalhoon/campstation-frontend/blob/main/docs/technical/05-STATE-MANAGEMENT.md}
 */
export function useReviews(
  campgroundId: number,
  params?: Omit<ReviewSearchParams, "campgroundId">
) {
  return useQuery({
    queryKey: ["reviews", campgroundId, params],
    queryFn: () => reviewApi.getAll(campgroundId, params),
    enabled: campgroundId > 0,
    staleTime: 5 * 60 * 1000, // 5분 (리뷰는 자주 변경되지 않음)
    gcTime: 10 * 60 * 1000, // 10분 (구 cacheTime)
    refetchOnWindowFocus: false, // 포커스 시 재검증 불필요
    retry: (failureCount, error) => {
      // 429 Too Many Requests는 재시도하지 않음
      if (
        error &&
        typeof error === "object" &&
        "status" in error &&
        error.status === 429
      ) {
        return false;
      }
      // 그 외 에러는 최대 2번까지 재시도
      return failureCount < 2;
    },
  });
}
