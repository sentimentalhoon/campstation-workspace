/**
 * CampgroundGridCard Component
 * Reusable campground card for 2-column grid layout
 * React 19+ with React Compiler auto-optimization
 */

import { Image } from "@/components/ui";
import {
  CERTIFICATION_LABELS,
  OPERATION_TYPE_LABELS,
  ROUTES,
} from "@/lib/constants";
import type { Campground } from "@/types/domain";
import { MapPin, Star } from "lucide-react";
import Link from "next/link";

interface CampgroundGridCardProps {
  campground: Campground;
}

export function CampgroundGridCard({ campground }: CampgroundGridCardProps) {
  const location = campground.address.split(" ").slice(0, 2).join(" ");
  const imageUrl =
    campground.thumbnailUrls?.[0] ||
    campground.imageUrl ||
    "/images/fallback-image.svg";

  return (
    <Link
      href={ROUTES.CAMPGROUNDS.DETAIL(campground.id)}
      className="border-border bg-card block overflow-hidden rounded-lg border shadow-sm transition-shadow hover:shadow-md active:scale-95"
    >
      {/* Image */}
      <div className="relative aspect-4/3">
        <Image
          src={imageUrl}
          alt={campground.name}
          width={400}
          height={300}
          fallback="/images/fallback-image.svg"
          aspectRatio="auto"
          objectFit="cover"
          rounded="none"
          className="bg-muted h-full w-full"
          sizes="(max-width: 640px) 50vw, 200px"
          unoptimized
        />

        {/* 배지: 우측 상단 */}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          {/* operationType이 DIRECT일 경우 표시 */}
          {campground.operationType === "DIRECT" && (
            <div className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-medium text-white shadow-sm">
              {OPERATION_TYPE_LABELS.DIRECT}
            </div>
          )}
          {/* certification이 PREMIUM일 경우 표시 */}
          {campground.certification === "PREMIUM" && (
            <div className="rounded-full bg-yellow-500 px-2 py-0.5 text-xs font-medium text-white shadow-sm">
              ⭐ {CERTIFICATION_LABELS.PREMIUM}
            </div>
          )}
        </div>

        {/* 평점 배지: 좌측 하단 */}
        {campground.rating > 0 && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-xs text-white">
            <Star className="fill-warning text-warning h-3 w-3" />
            <span className="font-medium">{campground.rating.toFixed(1)}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-1 p-3">
        <h3 className="text-foreground line-clamp-1 font-semibold">
          {campground.name}
        </h3>
        <div className="text-muted-foreground flex items-center gap-1 text-sm">
          <MapPin className="h-3.5 w-3.5" />
          <span className="line-clamp-1">{location}</span>
        </div>
      </div>
    </Link>
  );
}
