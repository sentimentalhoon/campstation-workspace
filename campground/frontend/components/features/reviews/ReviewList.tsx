/**
 * 리뷰 목록 컴포넌트
 *
 * 리뷰 목록을 표시하고 페이지네이션 및 정렬을 제공
 *
 * @see docs/sprints/sprint-5.md - P2-3: 리뷰 정렬 기능
 */

"use client";

import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useAuth } from "@/contexts";
import { useReviews } from "@/hooks/useReviews";
import { canAccessOwnerDashboard } from "@/lib/utils/permissions";
import type { ReviewSortOption } from "@/types";
import { ArrowUpDown, MessageSquarePlus } from "lucide-react";
import { useState } from "react";
import ReviewCard from "./ReviewCard";
import ReviewWriteModal from "./ReviewWriteModal";

type ReviewListProps = {
  campgroundId: number;
  campgroundName?: string; // 리뷰 작성 모달에 표시할 캠핑장 이름
  limit?: number; // 표시할 리뷰 개수 제한 (상세 페이지용)
  showSort?: boolean; // 정렬 옵션 표시 여부
};

const SORT_OPTIONS: { value: ReviewSortOption; label: string }[] = [
  { value: "latest", label: "최신순" },
  { value: "rating", label: "평점순" },
  { value: "likes", label: "좋아요순" },
];

export default function ReviewList({
  campgroundId,
  campgroundName = "캠핑장",
  limit = 5,
  showSort = true,
}: ReviewListProps) {
  const [sortBy, setSortBy] = useState<ReviewSortOption>("latest");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();

  // Owner 또는 Admin인지 확인
  const canWriteReview = canAccessOwnerDashboard(user);

  // Sort 매핑: frontend -> backend
  const getSortParam = (sort: ReviewSortOption): string => {
    switch (sort) {
      case "latest":
        return "createdAt,desc";
      case "rating":
        return "rating,desc";
      case "likes":
        return "likeCount,desc";
      default:
        return "createdAt,desc";
    }
  };

  const { data, isLoading, error } = useReviews(campgroundId, {
    page: 0,
    size: limit,
    sort: getSortParam(sortBy),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center text-sm text-neutral-500">
        리뷰를 불러올 수 없습니다
      </div>
    );
  }

  const reviews = data?.content || [];

  return (
    <div className="space-y-4">
      {/* 정렬 옵션 및 리뷰 작성 버튼 */}
      {showSort && (
        <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
          <div className="flex items-center gap-2 text-sm text-neutral-600">
            <ArrowUpDown className="h-4 w-4" />
            <span>정렬:</span>
          </div>
          <div className="flex items-center gap-3">
            {/* 정렬 버튼들 */}
            <div className="flex gap-2">
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSortBy(option.value)}
                  className={`rounded-full px-3 py-1 text-sm transition-colors ${
                    sortBy === option.value
                      ? "bg-primary text-white"
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {/* 리뷰 작성 버튼 (Owner/Admin만) */}
            {canWriteReview && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-primary hover:bg-primary/90 flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-white transition-colors active:scale-95"
              >
                <MessageSquarePlus className="h-4 w-4" />
                <span>리뷰 작성</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 리뷰가 없을 때 */}
      {reviews.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-sm text-neutral-500">
            아직 작성된 리뷰가 없습니다
          </p>
          {/* 리뷰 작성 버튼 (정렬 옵션이 없을 때를 위해) */}
          {!showSort && canWriteReview && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-primary hover:bg-primary/90 mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-white transition-colors active:scale-95"
            >
              <MessageSquarePlus className="h-4 w-4" />
              <span>첫 리뷰 작성하기</span>
            </button>
          )}
        </div>
      ) : (
        /* 리뷰 목록 */
        <div className="space-y-0">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}

      {/* 리뷰 작성 모달 */}
      <ReviewWriteModal
        campgroundId={campgroundId}
        campgroundName={campgroundName}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
