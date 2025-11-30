/**
 * MapCampgroundCard 컴포넌트
 * 지도 페이지 전용 캠핑장 카드 UI
 *
 * 레이아웃:
 * - Image (aspect-4/3): 456px height on 640px width
 * - Title (text-xl): 16px padding
 * - Location (text-sm): 8px gap
 * - Price + Button: 44px height
 */

"use client";

import { CategoryBadges } from "@/components/features/campgrounds/CategoryBadges";
import { ROUTES } from "@/lib/constants";
import type { Campground } from "@/types/domain";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

type MapCampgroundCardProps = {
  campground: Campground;
  markerIndex?: number; // 마커 번호 추가
  currentLocation?: { lat: number; lng: number }; // 현재 위치 추가
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

export function MapCampgroundCard({
  campground,
  markerIndex,
  currentLocation,
}: MapCampgroundCardProps) {
  const [imageError, setImageError] = useState(false);

  // 마커 색상 팔레트 (NaverMap과 동일)
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
      className="active:bg-muted block"
    >
      <div className="border-border overflow-hidden rounded-lg border bg-white">
        {/* 수평 레이아웃 */}
        <div className="flex gap-3 p-3">
          {/* Image - 고정 크기, 둥근 모서리 */}
          <div className="bg-muted relative h-24 w-24 shrink-0 overflow-hidden rounded-lg">
            {campground.thumbnailUrls?.[0] && !imageError ? (
              <Image
                src={campground.thumbnailUrls[0]}
                alt={campground.name}
                fill
                className="object-cover"
                sizes="96px"
                unoptimized
                onError={() => setImageError(true)}
              />
            ) : (
              <Image
                src="/images/fallback-image.svg"
                alt="이미지 없음"
                fill
                className="object-cover"
                sizes="96px"
              />
            )}

            {/* 마커 뱃지 - 이미지 왼쪽 상단 */}
            {markerColor && markerIndex !== undefined && (
              <div
                className="absolute top-1 left-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white text-xs font-bold text-white shadow-md"
                style={{ backgroundColor: markerColor }}
              >
                {markerIndex + 1}
              </div>
            )}
          </div>

          {/* Content - 오른쪽 정보 */}
          <div className="flex min-w-0 flex-1 flex-col justify-between">
            {/* Title */}
            <h3 className="line-clamp-1 text-base font-bold text-neutral-900">
              {campground.name}
            </h3>

            {/* Location and Distance */}
            <div className="flex items-center gap-2">
              <p className="line-clamp-1 min-w-0 flex-1 text-xs text-neutral-600">
                📍 {campground.address}
              </p>
              {distance !== null && (
                <span className="text-primary shrink-0 text-xs font-medium">
                  {distance < 1
                    ? `${Math.round(distance * 1000)}m`
                    : `${distance.toFixed(1)}km`}
                </span>
              )}
            </div>

            {/* Category Badges */}
            {(campground.operationType || campground.certification) && (
              <div className="flex items-center gap-2">
                <CategoryBadges
                  operationType={campground.operationType}
                  certification={campground.certification}
                  size="sm"
                />
              </div>
            )}

            {/* Price */}
            <div className="mt-1 flex items-center justify-between">
              <span className="text-base font-bold text-neutral-900">
                100,000원~
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
