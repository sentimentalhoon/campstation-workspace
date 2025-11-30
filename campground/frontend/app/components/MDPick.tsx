/**
 * MDPick Component
 * MD's pick campgrounds section
 * React 19+ with React Compiler auto-optimization
 */

import { CampgroundCardSkeleton } from "@/components/ui";
import type { Campground } from "@/types/domain";
import { CampgroundGridCard } from "./CampgroundGridCard";

interface MDPickProps {
  campgrounds: Campground[] | undefined;
  isLoading: boolean;
}

export function MDPick({
  campgrounds,
  isLoading,
}: MDPickProps) {
  return (
    <section className="container-mobile bg-card py-2">
      <div className="mb-4">
        <h2 className="text-foreground text-xl font-bold">MD 픽</h2>
        <p className="text-muted-foreground text-sm">
          캠프스테이션에서 추천하는 이달의 캠핑장
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3].map((i) => (
            <CampgroundCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {campgrounds?.slice(0, 3).map((campground) => (
            <CampgroundGridCard key={campground.id} campground={campground} />
          ))}
        </div>
      )}
    </section>
  );
}
