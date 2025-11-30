/**
 * ReviewTimeline Component
 * SNS-style review timeline (Graega-inspired)
 *
 * Features:
 * - Author profile with avatar
 * - Relative timestamps (e.g., "2시간 전")
 * - Inline image gallery
 * - Like/comment interactions inline
 * - Vertical timeline layout
 */

"use client";

import { ROUTES } from "@/lib/constants";
import type { Review } from "@/types/domain";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { Heart, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type ReviewTimelineProps = {
  reviews: Review[];
  showCampgroundInfo?: boolean;
};

export function ReviewTimeline({
  reviews,
  showCampgroundInfo = true,
}: ReviewTimelineProps) {
  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <article
          key={review.id}
          className="bg-card border-border rounded-lg border p-4 shadow-sm"
        >
          {/* Author Header */}
          <div className="mb-3 flex items-center gap-3">
            <div className="bg-muted relative h-10 w-10 overflow-hidden rounded-full">
              <div className="text-muted-foreground flex h-full w-full items-center justify-center font-semibold">
                {review.userName[0]}
              </div>
            </div>
            <div className="flex-1">
              <p className="text-foreground text-sm font-semibold">
                {review.userName}
              </p>
              <p className="text-muted-foreground text-xs">
                {formatDistanceToNow(new Date(review.createdAt), {
                  addSuffix: true,
                  locale: ko,
                })}
              </p>
            </div>
            {/* Rating */}
            <div className="flex items-center gap-1">
              <Star className="fill-warning text-warning h-4 w-4" />
              <span className="text-foreground text-sm font-semibold">
                {review.rating.toFixed(1)}
              </span>
            </div>
          </div>

          {/* Campground Info */}
          {showCampgroundInfo && review.campgroundName && (
            <Link
              href={ROUTES.CAMPGROUNDS.DETAIL(review.campgroundId)}
              className="text-primary mb-2 block text-sm font-medium hover:underline"
            >
              {review.campgroundName}
            </Link>
          )}

          {/* Review Content */}
          <p className="text-foreground mb-3 text-sm whitespace-pre-wrap">
            {review.comment}
          </p>

          {/* Image Gallery */}
          {review.images && review.images.length > 0 && (
            <div className="mb-3 grid grid-cols-3 gap-2">
              {review.images.slice(0, 3).map((imagePair, index) => (
                <div
                  key={index}
                  className="relative aspect-square overflow-hidden rounded-lg"
                >
                  <Image
                    src={imagePair.thumbnailUrl}
                    alt={`Review image ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 33vw, 200px"
                    unoptimized
                  />
                </div>
              ))}
            </div>
          )}

          {/* Interaction Bar */}
          <div className="flex items-center gap-4 pt-2">
            <button
              className="text-muted-foreground hover:text-primary flex items-center gap-1.5 text-sm transition-colors active:scale-95"
              aria-label="좋아요"
            >
              <Heart className="h-4 w-4" />
              <span>{review.likeCount || 0}</span>
            </button>
            {/* 댓글 기능은 향후 추가 예정 */}
          </div>
        </article>
      ))}
    </div>
  );
}
