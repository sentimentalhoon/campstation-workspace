/**
 * ThemeCampgrounds Component
 * Section showing theme-based campgrounds with filters
 * React 19+ with React Compiler auto-optimization
 */

import { CampgroundCardSkeleton } from "@/components/ui";
import { ROUTES } from "@/lib/constants";
import type { Campground } from "@/types/domain";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { CampgroundGridCard } from "./CampgroundGridCard";

const THEME_FILTERS = [
  { id: "latest", name: "사진 맛집", emoji: "📸" },
  { id: "view", name: "뷰 맛집", emoji: "🌄" },
  { id: "healing", name: "조용한 힐링 맛집", emoji: "😌" },
  { id: "shade", name: "시원한 그늘 맛집", emoji: "🌳" },
];

interface ThemeCampgroundsProps {
  campgrounds: Campground[] | undefined;
  isLoading: boolean;
}

export function ThemeCampgrounds({
  campgrounds,
  isLoading,
}: ThemeCampgroundsProps) {
  const [activeTheme, setActiveTheme] = useState("latest");

  return (
    <section className="container-mobile bg-muted/30 py-2">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-foreground text-xl font-bold">
          취향대로 캠핑하자!
        </h2>
        <Link
          href={ROUTES.CAMPGROUNDS.LIST}
          className="text-primary flex items-center gap-1 text-sm font-medium"
        >
          더보기
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Theme Filters */}
      <div className="scrollbar-hide mb-4 flex gap-2 overflow-x-auto">
        {THEME_FILTERS.map((theme) => (
          <button
            key={theme.id}
            onClick={() => setActiveTheme(theme.id)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              activeTheme === theme.id
                ? "bg-primary text-white"
                : "bg-card text-foreground hover:bg-muted"
            }`}
          >
            <span className="mr-1">{theme.emoji}</span>
            {theme.name}
          </button>
        ))}
      </div>

      {/* Theme Campgrounds Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <CampgroundCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {campgrounds?.slice(0, 4).map((campground) => (
            <CampgroundGridCard key={campground.id} campground={campground} />
          ))}
        </div>
      )}
    </section>
  );
}
