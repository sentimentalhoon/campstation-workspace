"use client";

import { SITE_TYPE_LABELS } from "@/lib/constants";
import { Site } from "@/types/domain/campground";

type SiteSelectorProps = {
  sites: Site[];
  selected?: number;
  onSelect: (siteId: number) => void;
  className?: string;
};

export default function SiteSelector({
  sites,
  selected,
  onSelect,
  className = "",
}: SiteSelectorProps) {
  if (sites.length === 0) {
    return (
      <div className={`py-8 text-center text-neutral-500 ${className}`}>
        예약 가능한 사이트가 없습니다
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {sites.map((site) => {
        const isSelected = selected === site.id;
        const isDisabled = site.status !== "AVAILABLE";

        return (
          <button
            key={site.id}
            onClick={() => !isDisabled && onSelect(site.id)}
            disabled={isDisabled}
            className={`w-full rounded-lg border-2 p-4 text-left transition-all ${
              isSelected
                ? "border-primary bg-primary/5"
                : "border-neutral-200 bg-white"
            } ${isDisabled ? "cursor-not-allowed opacity-50" : "hover:border-primary/50"} `}
          >
            <div className="flex items-start justify-between">
              {/* Left Section: Site Info */}
              <div className="flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <h3 className="text-lg font-bold">{site.siteNumber}</h3>
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${
                      site.siteType === "GLAMPING"
                        ? "bg-purple-100 text-purple-700"
                        : site.siteType === "CABIN"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-green-100 text-green-700"
                    } `}
                  >
                    {SITE_TYPE_LABELS[site.siteType] || site.siteType}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-sm text-neutral-600">
                  <span className="flex items-center gap-1">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    최대 {site.capacity}명
                  </span>

                  {isDisabled && (
                    <span className="font-medium text-red-500">예약 불가</span>
                  )}
                </div>
              </div>

              {/* Right Section: Price & Radio */}
              <div className="flex flex-col items-end gap-2">
                <div className="text-right">
                  <div className="text-primary text-xl font-bold">
                    ₩{site.basePrice.toLocaleString()}
                  </div>
                  <div className="text-xs text-neutral-500">1박 기준</div>
                </div>

                {/* Radio Button */}
                <div
                  className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${isSelected ? "border-primary" : "border-neutral-300"} `}
                >
                  {isSelected && (
                    <div className="bg-primary h-3 w-3 rounded-full"></div>
                  )}
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
