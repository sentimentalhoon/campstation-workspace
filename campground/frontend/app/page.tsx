/**
 * Main Home Page (Refactored)
 * Modular architecture with React 19+ and Next.js 16
 * All sections extracted to reusable components with memo optimization
 *
 * Design System v1.0:
 * - Mobile-first (max 640px)
 * - Design tokens (colors, spacing, typography)
 * - Touch-optimized (min 44px)
 * - Animations (active-scale)
 */

"use client";

import { usePopularCampgrounds } from "@/hooks/usePopularCampgrounds";
import { useRecentReviews } from "@/hooks/useRecentReviews";
import {
  SearchBar,
  CategoryGrid,
  PromotionBanner,
  QuickLinks,
  SpecialOffer,
  FeaturedCampgrounds,
  ThemeCampgrounds,
  MDPick,
  RecentReviews,
  RegionalCoupons,
} from "./components";

export default function Home() {
  // Data fetching
  const { data: popularCampgrounds, isLoading } = usePopularCampgrounds(6);
  const { data: recentReviews, isLoading: isLoadingReviews } =
    useRecentReviews(3);

  return (
    <main className="min-h-screen pb-20">
      {/* Search Bar */}
      <SearchBar />

      {/* Categories Grid */}
      <CategoryGrid />

      {/* Promotion Banner */}
      <PromotionBanner />

      {/* Quick Links */}
      <QuickLinks />

      {/* Special Offer */}
      <SpecialOffer />

      {/* Featured Campgrounds - 여행이 특별해지는 곳 */}
      <FeaturedCampgrounds
        campgrounds={popularCampgrounds}
        isLoading={isLoading}
      />

      {/* Theme Based Campgrounds - 취향대로 캠핑하자 */}
      <ThemeCampgrounds campgrounds={popularCampgrounds} isLoading={isLoading} />

      {/* MD Pick */}
      <MDPick campgrounds={popularCampgrounds} isLoading={isLoading} />

      {/* Recent Reviews - 캠톡 */}
      <RecentReviews reviews={recentReviews} isLoading={isLoadingReviews} />

      {/* Regional Coupons */}
      <RegionalCoupons />
    </main>
  );
}
