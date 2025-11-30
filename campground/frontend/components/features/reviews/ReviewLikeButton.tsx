/**
 * 리뷰 좋아요 버튼 컴포넌트
 *
 * @see docs/sprints/sprint-5.md - P2-3: 리뷰 좋아요 기능
 */

"use client";

import { useLikeReview } from "@/hooks";
import { Heart } from "lucide-react";

type ReviewLikeButtonProps = {
  /**
   * 리뷰 ID
   */
  reviewId: number;

  /**
   * 초기 좋아요 여부
   */
  initialIsLiked?: boolean;

  /**
   * 초기 좋아요 개수
   */
  initialLikeCount: number;

  /**
   * 버튼 크기
   */
  size?: "sm" | "md" | "lg";

  /**
   * 개수 표시 여부
   */
  showCount?: boolean;
};

/**
 * ReviewLikeButton 컴포넌트
 *
 * 리뷰에 좋아요를 추가하거나 취소할 수 있습니다.
 *
 * @example
 * ```tsx
 * <ReviewLikeButton
 *   reviewId={123}
 *   initialIsLiked={false}
 *   initialLikeCount={5}
 *   showCount
 * />
 * ```
 */
export function ReviewLikeButton({
  reviewId,
  initialIsLiked = false,
  initialLikeCount,
  size = "md",
  showCount = true,
}: ReviewLikeButtonProps) {
  const likeReview = useLikeReview();

  // 서버 상태를 신뢰 (낙관적 업데이트 제거)
  const isLiked = initialIsLiked;
  const likeCount = initialLikeCount || 0;

  const handleClick = async () => {
    if (likeReview.isPending) {
      return;
    }

    try {
      await likeReview.mutateAsync({ reviewId, isLiked });
    } catch (error) {
      console.error("좋아요 실패:", error);
    }
  };

  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={likeReview.isPending}
      className="flex items-center gap-1 text-gray-600 transition-colors hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
      aria-label={isLiked ? "좋아요 취소" : "좋아요"}
    >
      <Heart
        className={`${sizeClasses[size]} transition-all ${
          isLiked ? "fill-red-500 text-red-500" : ""
        }`}
      />
      {showCount && (
        <span className={`${textSizeClasses[size]} font-medium`}>
          {(likeCount || 0).toLocaleString()}
        </span>
      )}
    </button>
  );
}
