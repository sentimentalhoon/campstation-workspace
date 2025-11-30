"use client";

import { Button } from "@/components/ui/Button";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import type { Site } from "@/types";
import { Settings } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

const SiteCard = dynamic(
  () => import("@/components/features/campground/SiteCard"),
  {
    loading: () => <LoadingSpinner />,
    ssr: false,
  }
);

interface CampgroundSitesSectionProps {
  campgroundId: number;
  dateRange: { start: Date; end: Date } | null;
  availableCount: number;
  sitesLoading: boolean;
  sitesError: Error | null;
  sitesData?: { content: Site[] };
  checkInTime?: string;
  checkOutTime?: string;
  canEdit: boolean;
  getSiteAvailability: (site: Site) => boolean;
  onSelectSite: (site: Site) => void;
}

export default function CampgroundSitesSection({
  campgroundId,
  dateRange,
  availableCount,
  sitesLoading,
  sitesError,
  sitesData,
  checkInTime,
  checkOutTime,
  canEdit,
  getSiteAvailability,
  onSelectSite,
}: CampgroundSitesSectionProps) {
  const router = useRouter();

  const handleManageSites = () => {
    router.push(`/dashboard/owner/campgrounds/${campgroundId}/sites`);
  };

  return (
    <section className="border-t border-neutral-200 px-4 py-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-bold">
          사이트 선택
          {dateRange && (
            <span className="ml-2 text-sm font-normal text-neutral-500">
              ({availableCount}개 예약 가능)
            </span>
          )}
        </h2>
        {canEdit && (
          <Button variant="outline" size="sm" onClick={handleManageSites}>
            <Settings className="mr-1 h-4 w-4" />
            사이트 관리
          </Button>
        )}
      </div>
      {sitesLoading ? (
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner />
        </div>
      ) : sitesError ? (
        <ErrorMessage message="사이트 목록을 불러올 수 없습니다" />
      ) : sitesData && sitesData.content.length > 0 ? (
        <div className="space-y-3">
          {sitesData.content.map((site: Site) => {
            const isAvailable = getSiteAvailability(site);
            return (
              <SiteCard
                key={site.id}
                site={site}
                isAvailable={isAvailable}
                checkInTime={checkInTime}
                checkOutTime={checkOutTime}
                onSelectSite={(selectedSite) => {
                  if (!isAvailable) return;
                  onSelectSite(selectedSite);
                }}
              />
            );
          })}
        </div>
      ) : (
        <div className="rounded-lg border border-neutral-200 p-8 text-center">
          <p className="text-sm text-neutral-500">
            현재 예약 가능한 사이트가 없습니다
          </p>
        </div>
      )}
    </section>
  );
}
