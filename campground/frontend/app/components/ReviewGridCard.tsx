/**
 * ReviewGridCard Component
 * Reusable review card for 2-column grid layout
 * React 19+ with React Compiler auto-optimization
 */

import type { Review } from "@/types/domain";
import { Star } from "lucide-react";

interface ReviewGridCardProps {
  review: Review;
}

export function ReviewGridCard({
  review,
}: ReviewGridCardProps) {
  return (
    <div className="border-border bg-card overflow-hidden rounded-lg border p-3 shadow-sm">
      {/* Header */}
      <div className="mb-2 flex items-center justify-between">
        <span className="text-foreground text-sm font-medium">
          {review.userName}
        </span>
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-3 w-3 ${
                i < review.rating
                  ? "fill-warning text-warning"
                  : "fill-muted text-muted"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Comment */}
      <p className="text-foreground mb-2 line-clamp-2 text-sm">
        &quot;{review.comment}&quot;
      </p>

      {/* Campground */}
      <p className="text-muted-foreground line-clamp-1 text-xs">
        {review.campgroundName}
      </p>
    </div>
  );
}
