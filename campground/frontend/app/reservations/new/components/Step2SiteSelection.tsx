/**
 * Step2SiteSelection Component
 * Site selection UI with loading state
 * React 19+ with React Compiler auto-optimization
 */

import SiteSelector from "@/components/features/SiteSelector";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import type { Site } from "@/types/domain/campground";

interface Step2SiteSelectionProps {
  sites: Site[];
  selectedSiteId: number | undefined;
  loadingSites: boolean;
  onSelect: (siteId: number | undefined) => void;
}

export function Step2SiteSelection({
  sites,
  selectedSiteId,
  loadingSites,
  onSelect,
}: Step2SiteSelectionProps) {
  return (
    <div className="rounded-lg bg-white p-4">
      <h3 className="mb-4 text-base font-bold">사이트 선택</h3>
      {loadingSites ? (
        <LoadingSpinner size="md" />
      ) : (
        <SiteSelector
          sites={sites}
          selected={selectedSiteId}
          onSelect={onSelect}
        />
      )}
    </div>
  );
}
