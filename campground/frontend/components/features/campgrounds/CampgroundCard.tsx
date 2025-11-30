/**
 * CampgroundCard 컴포넌트
 * Graega-inspired image-centric campground card
 *
 * Features:
 * - Large 16:9 image ratio for visual impact
 * - Minimal text overlay on image
 * - Lazy loading for performance
 * - Hover effects for desktop
 * - Mobile-first responsive design
 */

"use client";

import { AMENITY_ICONS, AMENITY_LABELS, ROUTES } from "@/lib/constants";
import type { Amenity, Campground } from "@/types/domain";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { CategoryBadges } from "./CategoryBadges";

type CampgroundCardProps = {
  campground: Campground;
  markerIndex?: number;
  currentLocation?: { lat: number; lng: number };
  amenities?: Amenity[];
  priority?: boolean; // First visible cards should use priority loading
};

// 두 지점 간의 거리 계산 (Haversine 공식)
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // 지구 반경 (km)
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
}

export function CampgroundCard({
  campground,
  markerIndex,
  currentLocation,
  amenities,
  priority = false,
}: CampgroundCardProps) {
  const [imageError, setImageError] = useState(false);

  const displayAmenities = amenities || campground.amenities || [];

  // 마커 색상 팔레트
  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#FFA07A",
    "#98D8C8",
    "#F7DC6F",
    "#BB8FCE",
    "#85C1E2",
    "#F8B195",
    "#C06C84",
  ];

  const markerColor =
    markerIndex !== undefined ? colors[markerIndex % colors.length] : null;

  // 거리 계산
  const distance = currentLocation
    ? calculateDistance(
        currentLocation.lat,
        currentLocation.lng,
        campground.latitude,
        campground.longitude
      )
    : null;

  return (
    <Link
      href={ROUTES.CAMPGROUNDS.DETAIL(campground.id)}
      className="group block"
    >
      <article className="bg-card overflow-hidden rounded-2xl shadow-md transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl">
        {/* Image - 16:9 for visual impact */}
        <div className="bg-muted relative aspect-video w-full overflow-hidden">
          {campground.thumbnailUrls?.[0] && !imageError ? (
            <Image
              src={campground.thumbnailUrls[0]}
              alt={campground.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority={priority}
              loading={priority ? "eager" : "lazy"}
              unoptimized
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="bg-muted flex h-full w-full items-center justify-center">
              <span className="text-muted-foreground text-4xl">🏕️</span>
            </div>
          )}

          {/* Overlay gradient for text readability */}
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />

          {/* Marker badge */}
          {markerColor && markerIndex !== undefined && (
            <div
              className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white text-xs font-bold text-white shadow-lg"
              style={{ backgroundColor: markerColor }}
            >
              {markerIndex + 1}
            </div>
          )}

          {/* Price overlay - bottom left */}
          <div className="absolute bottom-3 left-3">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-white drop-shadow-lg">
                50,000원
              </span>
              <span className="text-sm text-white/90">~</span>
            </div>
            <span className="text-xs text-white/80">1박 기준</span>
          </div>

          {/* Rating badge - top left */}
          {campground.rating && campground.rating > 0 && (
            <div className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 backdrop-blur-sm">
              <span className="text-yellow-500">⭐</span>
              <span className="text-foreground text-sm font-semibold">
                {campground.rating.toFixed(1)}
              </span>
            </div>
          )}
        </div>

        {/* Content - Minimal */}
        <div className="p-4">
          {/* Title */}
          <h3 className="text-foreground mb-2 line-clamp-1 text-lg font-bold">
            {campground.name}
          </h3>

          {/* Category Badges */}
          {(campground.operationType || campground.certification) && (
            <div className="mb-2">
              <CategoryBadges
                operationType={campground.operationType}
                certification={campground.certification}
                size="sm"
              />
            </div>
          )}

          {/* Location */}
          <div className="text-muted-foreground mb-3 flex items-center gap-1">
            <span>📍</span>
            <p className="line-clamp-1 text-sm">{campground.address}</p>
          </div>

          {/* Amenities - horizontal scroll */}
          {displayAmenities && displayAmenities.length > 0 && (
            <div className="hide-scrollbar flex gap-2 overflow-x-auto">
              {displayAmenities.slice(0, 3).map((amenity) => (
                <div
                  key={amenity}
                  className="bg-muted text-muted-foreground flex shrink-0 items-center gap-1 rounded-full px-3 py-1 text-xs"
                  title={AMENITY_LABELS[amenity] || amenity}
                >
                  <span>{AMENITY_ICONS[amenity] || "📌"}</span>
                  <span>{AMENITY_LABELS[amenity] || amenity}</span>
                </div>
              ))}
            </div>
          )}

          {/* Distance (if available) */}
          {distance !== null && (
            <p className="text-muted-foreground mt-2 text-xs">
              현재 위치에서 {distance.toFixed(1)}km
            </p>
          )}
        </div>
      </article>
    </Link>
  );
}
