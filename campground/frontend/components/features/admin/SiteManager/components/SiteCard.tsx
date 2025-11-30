/**
 * SiteCard Component
 * Display individual site information
 */

import {
  AMENITY_LABELS,
  SITE_STATUS_LABELS,
  SITE_TYPE_LABELS,
} from "@/lib/constants";
import { Site } from "@/types/domain";
import { Edit2, ImageIcon, Trash2 } from "lucide-react";
import Image from "next/image";


interface SiteCardProps {
  site: Site;
  onEdit: (site: Site) => void;
  onDelete: (siteId: number) => void;
}

export function SiteCard({
  site,
  onEdit,
  onDelete,
}: SiteCardProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* Thumbnail Image */}
      <div className="relative h-48 w-full bg-gray-100">
        {site.thumbnailUrls && site.thumbnailUrls.length > 0 && site.thumbnailUrls[0] ? (
          <Image
            src={site.thumbnailUrls[0]}
            alt={`${site.siteNumber} 썸네일`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ImageIcon className="h-12 w-12 text-gray-300" />
          </div>
        )}
        {site.thumbnailUrls && site.thumbnailUrls.length > 1 && (
          <div className="absolute right-2 bottom-2 rounded bg-black/50 px-2 py-1 text-xs text-white">
            +{site.thumbnailUrls.length - 1}
          </div>
        )}
      </div>

      <div className="p-4">
        {/* Header */}
        <div className="mb-3 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {site.siteNumber}
            </h3>
            <p className="text-sm text-gray-500">
              {SITE_TYPE_LABELS[site.siteType]}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(site)}
              className="hover:text-primary-600 p-1 text-gray-400 transition-colors"
              title="수정"
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete(site.id)}
              className="p-1 text-gray-400 transition-colors hover:text-red-600"
              title="삭제"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="mb-3 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">수용 인원</span>
            <span className="font-medium text-gray-900">{site.capacity}명</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">기본 가격</span>
            <span className="font-medium text-gray-900">
              {site.basePrice.toLocaleString()}원
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">상태</span>
            <span
              className={`rounded-full px-2 py-1 text-xs font-medium ${
                site.status === "AVAILABLE"
                  ? "bg-green-100 text-green-800"
                  : site.status === "MAINTENANCE"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
              }`}
            >
              {
                SITE_STATUS_LABELS[
                  site.status as keyof typeof SITE_STATUS_LABELS
                ]
              }
            </span>
          </div>
        </div>

        {/* Amenities */}
        {site.amenities.length > 0 && (
          <div className="border-t border-gray-100 pt-3">
            <p className="mb-2 text-xs text-gray-500">편의시설</p>
            <div className="flex flex-wrap gap-1">
              {site.amenities.slice(0, 3).map((amenity) => (
                <span
                  key={amenity}
                  className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700"
                >
                  {AMENITY_LABELS[amenity]}
                </span>
              ))}
              {site.amenities.length > 3 && (
                <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700">
                  +{site.amenities.length - 3}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
