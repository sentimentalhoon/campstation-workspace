"use client";

import FacilityGrid from "@/components/features/FacilityGrid";

interface CampgroundFacilitiesProps {
  facilities: string[];
}

export default function CampgroundFacilities({
  facilities,
}: CampgroundFacilitiesProps) {
  if (facilities.length === 0) {
    return null;
  }

  return (
    <section className="border-t border-neutral-200 px-4 py-6">
      <h2 className="mb-4 text-base font-bold">편의시설</h2>
      <FacilityGrid facilities={facilities} />
    </section>
  );
}
