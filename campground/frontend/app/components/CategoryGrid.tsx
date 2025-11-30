/**
 * CategoryGrid Component
 * Horizontal scrollable category tabs (Graega-style)
 * React 19+ with React Compiler auto-optimization
 */

"use client";

import { CategoryTabs } from "@/components/common/CategoryTabs";
import { ROUTES } from "@/lib/constants";
import { Suspense } from "react";

const CATEGORIES = [
  {
    id: "direct",
    label: "직영 캠핑장",
    href: `${ROUTES.CAMPGROUNDS.LIST}?category=direct`,
    icon: "🏕️",
  },
  {
    id: "auto",
    label: "오토캠핑장",
    href: `${ROUTES.CAMPGROUNDS.LIST}?category=auto`,
    icon: "🚗",
  },
  {
    id: "glamping",
    label: "글램핑",
    href: `${ROUTES.CAMPGROUNDS.LIST}?category=glamping`,
    icon: "⛺",
  },
  {
    id: "caravan",
    label: "카라반",
    href: `${ROUTES.CAMPGROUNDS.LIST}?category=caravan`,
    icon: "🚐",
  },
  {
    id: "pet",
    label: "반려동반",
    href: `${ROUTES.CAMPGROUNDS.LIST}?category=pet`,
    icon: "🐕",
  },
  {
    id: "kids",
    label: "키즈",
    href: `${ROUTES.CAMPGROUNDS.LIST}?category=kids`,
    icon: "👶",
  },
  {
    id: "pension",
    label: "펜션",
    href: `${ROUTES.CAMPGROUNDS.LIST}?category=pension`,
    icon: "🏠",
  },
  {
    id: "campnic",
    label: "캠프닉",
    href: `${ROUTES.CAMPGROUNDS.LIST}?category=campnic`,
    icon: "🌳",
  },
];

export function CategoryGrid() {
  return (
    <section className="container-mobile py-4">
      <Suspense fallback={<CategoryGridSkeleton />}>
        <CategoryTabs categories={CATEGORIES} />
      </Suspense>
    </section>
  );
}

/**
 * Skeleton loader for CategoryGrid
 */
function CategoryGridSkeleton() {
  return (
    <div className="hide-scrollbar overflow-x-auto">
      <div className="flex gap-2 pb-2">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div
            key={i}
            className="bg-muted h-11 w-24 shrink-0 animate-pulse rounded-full"
          />
        ))}
      </div>
    </div>
  );
}
