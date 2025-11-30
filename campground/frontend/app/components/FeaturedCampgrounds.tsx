/**
 * FeaturedCampgrounds Component
 * Section showing special featured campgrounds
 * React 19+ with React Compiler auto-optimization
 */

import { CampgroundCardSkeleton } from "@/components/ui";
import type { Campground } from "@/types/domain";
import { CampgroundGridCard } from "./CampgroundGridCard";

interface FeaturedCampgroundsProps {
  campgrounds: Campground[] | undefined;
  isLoading: boolean;
}

export function FeaturedCampgrounds({
  campgrounds,
  isLoading,
}: FeaturedCampgroundsProps) {
  return (
    <section className="container-mobile bg-card py-2">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-foreground text-xl font-bold">
          여행이 특별해지는 곳
        </h2>
        <button className="bg-muted text-muted-foreground rounded-full px-3 py-1 text-xs font-medium">
          AD
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <CampgroundCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {campgrounds?.slice(0, 2).map((campground) => (
            <CampgroundGridCard key={campground.id} campground={campground} />
          ))}
        </div>
      )}
    </section>
  );
}
