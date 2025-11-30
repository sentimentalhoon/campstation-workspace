"use client";

import ReviewList from "@/components/features/reviews/ReviewList";

interface CampgroundReviewsSectionProps {
  campgroundId: number;
  campgroundName: string;
  rating?: number;
  reviewCount?: number;
}

export default function CampgroundReviewsSection({
  campgroundId,
  campgroundName,
  rating,
  reviewCount,
}: CampgroundReviewsSectionProps) {
  return (
    <section className="border-t border-neutral-200 px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-bold">리뷰</h2>
        <button className="text-primary text-sm">모든 리뷰 보기</button>
      </div>

      <div className="mb-4 flex items-center gap-2">
        <span className="text-yellow-500">★</span>
        <span className="text-lg font-bold">{(rating || 0).toFixed(1)}</span>
        <span className="text-sm text-neutral-500">
          평균 ({reviewCount || 0}개)
        </span>
      </div>

      <ReviewList
        campgroundId={campgroundId}
        campgroundName={campgroundName}
        limit={3}
        showSort={true}
      />
    </section>
  );
}
