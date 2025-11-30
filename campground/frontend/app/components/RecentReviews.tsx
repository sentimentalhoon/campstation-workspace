/**
 * RecentReviews Component
 * Section showing recent campground reviews (캠톡) with timeline layout
 * React 19+ with React Compiler auto-optimization
 */

"use client";

import { ReviewTimeline } from "@/components/common/ReviewTimeline";
import { ListSkeleton, ReviewCardSkeleton } from "@/components/ui";
import { ROUTES } from "@/lib/constants";
import type { Review } from "@/types/domain";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

interface RecentReviewsProps {
  reviews: Review[] | undefined;
  isLoading: boolean;
}

export function RecentReviews({ reviews, isLoading }: RecentReviewsProps) {
  return (
    <section className="container-mobile py-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-foreground text-xl font-bold">캠톡</h2>
        <Link
          href={ROUTES.CAMPGROUNDS.LIST}
          className="text-primary flex items-center gap-1 text-sm font-medium"
        >
          더보기
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {isLoading ? (
        <ListSkeleton
          count={3}
          ItemSkeleton={ReviewCardSkeleton}
          className="space-y-3"
        />
      ) : reviews && reviews.length > 0 ? (
        <ReviewTimeline reviews={reviews.slice(0, 3)} showCampgroundInfo />
      ) : (
        <p className="text-muted-foreground py-8 text-center text-sm">
          아직 작성된 리뷰가 없습니다.
        </p>
      )}
    </section>
  );
}
