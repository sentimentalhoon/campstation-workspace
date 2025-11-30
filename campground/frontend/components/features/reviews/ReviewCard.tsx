/**
 * 리뷰 카드 컴포넌트
 *
 * 개별 리뷰를 표시하는 카드 컴포넌트
 * - 작성자 정보
 * - 평점
 * - 리뷰 내용
 * - 작성일
 * - 이미지 (있는 경우)
 */

"use client";

import {
  ReviewLikeButton,
  ReviewReportModal,
} from "@/components/features/reviews";
import type { Review } from "@/types";
import { Flag } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import ReviewDetailModal from "./ReviewDetailModal";

type ReviewCardProps = {
  review: Review;
};

export default function ReviewCard({ review }: ReviewCardProps) {
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  const [showReportModal, setShowReportModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={i < rating ? "text-yellow-500" : "text-neutral-300"}
      >
        ★
      </span>
    ));
  };

  return (
    <>
      <div
        className="cursor-pointer border-b border-neutral-200 py-4 transition-colors last:border-b-0 hover:bg-neutral-50"
        onClick={() => setShowDetailModal(true)}
      >
        {/* Header: 작성자 & 평점 */}
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-200 text-sm font-medium">
              {review.userName.charAt(0)}
            </div>
            <div>
              <div className="text-sm font-medium">{review.userName}</div>
              <div className="text-xs text-neutral-500">
                {formatDate(review.createdAt)}
              </div>
            </div>
          </div>
          <div className="flex gap-0.5">{renderStars(review.rating)}</div>
        </div>

        {/* 리뷰 내용 */}
        <p className="text-sm leading-relaxed text-neutral-700">
          {review.comment}
        </p>

        {/* 이미지 (있는 경우) */}
        {review.images && review.images.length > 0 && (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
            {review.images.map((image, index) => (
              <div
                key={index}
                className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg"
              >
                <Image
                  src={
                    imageErrors[index]
                      ? "/images/fallback-image.svg"
                      : image.thumbnailUrl
                  }
                  alt={`리뷰 이미지 ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                  unoptimized={!imageErrors[index]}
                  onError={() =>
                    setImageErrors((prev) => ({ ...prev, [index]: true }))
                  }
                />
              </div>
            ))}
          </div>
        )}

        {/* 좋아요 버튼 */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <ReviewLikeButton
              reviewId={review.id}
              initialIsLiked={review.isLiked}
              initialLikeCount={review.likeCount}
              size="sm"
              showCount
            />
            {review.likeCount > 0 && (
              <span className="text-xs text-neutral-500">
                {review.likeCount}명이 도움이 되었다고 했습니다
              </span>
            )}
          </div>

          {/* 신고 버튼 */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowReportModal(true);
            }}
            className="flex items-center gap-1 text-xs text-gray-400 transition-colors hover:text-gray-600"
            aria-label="리뷰 신고"
          >
            <Flag className="h-3 w-3" />
            <span>신고</span>
          </button>
        </div>
      </div>

      {/* 신고 모달 */}
      {showReportModal && (
        <ReviewReportModal
          reviewId={review.id}
          onClose={() => setShowReportModal(false)}
        />
      )}

      {/* 상세 모달 */}
      {showDetailModal && (
        <ReviewDetailModal
          review={review}
          onClose={() => setShowDetailModal(false)}
        />
      )}
    </>
  );
}
