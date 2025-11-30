"use client";

import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import type { Site } from "@/types";
import dynamic from "next/dynamic";

const NaverMap = dynamic(
  () =>
    import("@/components/features/map/NaverMap").then((mod) => mod.NaverMap),
  {
    loading: () => (
      <div className="flex h-full items-center justify-center bg-neutral-100">
        <LoadingSpinner />
      </div>
    ),
    ssr: false,
  }
);

interface CampgroundMapSectionProps {
  campground: {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    address: string;
  };
  sites?: Site[];
}

export default function CampgroundMapSection({
  campground,
  sites = [],
}: CampgroundMapSectionProps) {
  if (!campground.latitude || !campground.longitude) {
    return null;
  }

  return (
    <section className="border-t border-neutral-200 px-4 py-6">
      <h2 className="mb-4 text-base font-bold">위치</h2>
      <div className="h-[300px] overflow-hidden rounded-lg">
        <NaverMap
          center={{
            lat: campground.latitude,
            lng: campground.longitude,
          }}
          zoom={15}
          markers={[
            // 캠핑장 메인 마커
            {
              id: campground.id,
              position: {
                lat: campground.latitude,
                lng: campground.longitude,
              },
              title: campground.name,
              type: "campground",
            },
            // 사이트 마커들
            ...sites
              .filter((site) => site.latitude && site.longitude)
              .map((site) => ({
                id: site.id,
                position: {
                  lat: site.latitude!,
                  lng: site.longitude!,
                },
                title: site.siteNumber,
                type: "site" as const,
              })),
          ]}
        />
      </div>
      <p className="mt-2 text-xs text-neutral-500">📍 {campground.address}</p>
    </section>
  );
}
