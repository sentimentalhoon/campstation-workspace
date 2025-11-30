"use client";

import { Button } from "@/components/ui/Button";
import {
  CERTIFICATION_LABELS,
  OPERATION_TYPE_LABELS,
} from "@/lib/constants";
import type {
  CampgroundCertification,
  CampgroundOperationType,
} from "@/types/domain";

interface CampgroundInfoSectionProps {
  campground: {
    id: number;
    name: string;
    rating?: number;
    reviewCount?: number;
    address: string;
    latitude: number;
    longitude: number;
    operationType?: CampgroundOperationType;
    certification?: CampgroundCertification;
  };
  currentLocation?: { lat: number; lng: number } | null;
  canEdit: boolean;
  onEdit: () => void;
}

export default function CampgroundInfoSection({
  campground,
  currentLocation,
  canEdit,
  onEdit,
}: CampgroundInfoSectionProps) {
  return (
    <section className="px-4 py-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h1 className="text-xl font-bold text-neutral-900">
            {campground.name}
          </h1>

          {/* Rating */}
          <div className="mt-1 flex items-center gap-2">
            <div className="flex items-center">
              <span className="text-yellow-500">★★★★☆</span>
              <span className="ml-1 text-sm font-medium">
                {(campground.rating || 0).toFixed(1)}
              </span>
            </div>
            <span className="text-sm text-neutral-500">
              ({campground.reviewCount || 0})
            </span>
          </div>

          {/* Location */}
          <div className="mt-1 flex items-center gap-1 text-neutral-600">
            <span>📍</span>
            <span className="text-sm">{campground.address}</span>
          </div>

          {/* Distance from current location */}
          {currentLocation && (
            <div className="mt-1 flex items-center gap-1 text-neutral-500">
              <span>🗺️</span>
              <span className="text-sm">
                {(() => {
                  const R = 6371;
                  const dLat =
                    ((campground.latitude - currentLocation.lat) * Math.PI) /
                    180;
                  const dLon =
                    ((campground.longitude - currentLocation.lng) * Math.PI) /
                    180;
                  const a =
                    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                    Math.cos((currentLocation.lat * Math.PI) / 180) *
                      Math.cos((campground.latitude * Math.PI) / 180) *
                      Math.sin(dLon / 2) *
                      Math.sin(dLon / 2);
                  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                  const distance = R * c;
                  return distance < 1
                    ? `${(distance * 1000).toFixed(0)}m`
                    : `${distance.toFixed(1)}km`;
                })()}{" "}
                떨어짐
              </span>
            </div>
          )}

          {/* 카테고리 배지: operationType & certification */}
          {(campground.operationType || campground.certification) && (
            <div className="mt-2 flex flex-wrap gap-2">
              {campground.operationType && (
                <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                  {OPERATION_TYPE_LABELS[campground.operationType]}
                </span>
              )}
              {campground.certification && (
                <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">
                  {campground.certification === "PREMIUM" && "⭐ "}
                  {CERTIFICATION_LABELS[campground.certification]}
                </span>
              )}
            </div>
          )}
        </div>

        {/* 수정 버튼 (OWNER/ADMIN만) */}
        {canEdit && (
          <Button variant="outline" size="sm" onClick={onEdit}>
            수정
          </Button>
        )}
      </div>
    </section>
  );
}
