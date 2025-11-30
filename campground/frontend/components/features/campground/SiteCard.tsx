"use client";

import { Badge } from "@/components/ui/Badge";
import { AMENITY_ICONS, SITE_TYPE_LABELS } from "@/lib/constants";
import { formatHour } from "@/lib/utils";
import type { Site } from "@/types";
import Image from "next/image";

type SiteCardProps = {
  site: Site;
  isAvailable?: boolean; // 날짜 범위 기준 예약 가능 여부
  checkInTime?: string;
  checkOutTime?: string;
  onSelectSite?: (site: Site) => void;
};

export default function SiteCard({
  site,
  isAvailable = true, // 기본값 true (날짜 선택 안했을 때)
  checkInTime,
  checkOutTime,
  onSelectSite,
}: SiteCardProps) {
  const hasImages = site.thumbnailUrls && site.thumbnailUrls.length > 0;
  const imageUrl = hasImages ? site.thumbnailUrls[0] : null;

  // 사이트 자체가 UNAVAILABLE이거나 MAINTENANCE 상태인지 체크
  const siteStatusDisabled =
    site.status === "UNAVAILABLE" || site.status === "MAINTENANCE";

  // 최종 예약 가능 여부: 사이트 상태가 정상이고 + 날짜 범위에서도 가능해야 함
  const canReserve = !siteStatusDisabled && isAvailable;

  return (
    <div className="relative">
      <button
        onClick={() => canReserve && onSelectSite?.(site)}
        disabled={!canReserve}
        className={`group w-full overflow-hidden rounded-lg border text-left transition-all ${
          canReserve
            ? "cursor-pointer border-neutral-200 hover:border-green-500 hover:shadow-md"
            : "cursor-not-allowed border-neutral-100 bg-neutral-50 opacity-60"
        }`}
      >
        <div className="flex gap-0">
          <div className="relative h-32 w-32 shrink-0 overflow-hidden bg-neutral-100">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={site.siteNumber}
                fill
                className="object-cover transition-transform group-hover:scale-105"
                sizes="128px"
                unoptimized
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-neutral-100 to-neutral-200">
                <span className="text-4xl">🏕️</span>
              </div>
            )}
            {canReserve && (
              <div className="absolute top-2 left-2 rounded bg-orange-500 px-2 py-0.5 text-xs font-medium text-white">
                예약가능
              </div>
            )}
            {!canReserve && (
              <div className="absolute top-2 left-2 rounded bg-red-500 px-2 py-0.5 text-xs font-medium text-white">
                {siteStatusDisabled ? "이용 불가" : "예약 마감"}
              </div>
            )}
          </div>
          <div className="flex flex-1 flex-col justify-between p-3">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <h3 className="text-base font-bold text-neutral-900">
                  {site.siteNumber}
                </h3>
                {!canReserve && (
                  <Badge variant="outline" className="text-xs text-red-600">
                    {siteStatusDisabled ? "이용 불가" : "예약 불가"}
                  </Badge>
                )}
              </div>
              <div className="mb-2 text-xs text-neutral-600">
                {SITE_TYPE_LABELS[site.siteType] || site.siteType}
                {checkInTime && ` · 입실 ${formatHour(checkInTime)}`}
                {checkOutTime && ` · 퇴실 ${formatHour(checkOutTime)}`}
              </div>
              <div className="mb-1 text-xs text-neutral-500">
                규격 : 10.0m × 10.0m
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div className="flex items-center gap-1 text-neutral-500">
                {site.amenities?.slice(0, 3).map((amenity) => (
                  <span key={amenity} className="text-sm" title={amenity}>
                    {AMENITY_ICONS[amenity] || "�"}
                  </span>
                ))}
                {site.amenities && site.amenities.length > 3 && (
                  <span className="text-xs text-neutral-400">
                    +{site.amenities.length - 3}
                  </span>
                )}
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-orange-500">
                  {site.basePrice.toLocaleString()}원
                </div>
              </div>
            </div>
          </div>
        </div>
      </button>
    </div>
  );
}
