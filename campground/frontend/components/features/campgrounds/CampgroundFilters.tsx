/**
 * CampgroundFilters 컴포넌트
 *
 * 캠핑장 검색 고급 필터
 * - 가격대 필터
 * - 편의시설 필터
 * - 캠핑 타입 필터
 * - 인원 수 필터
 *
 * @see docs/sprints/sprint-5.md
 */

"use client";

import { Button } from "@/components/ui";
import {
  AMENITY_CATEGORIES,
  AMENITY_LABELS,
  CAPACITY_OPTIONS,
  CERTIFICATION_OPTIONS,
  OPERATION_TYPE_OPTIONS,
  PRICE_RANGES,
  REGION_OPTIONS,
  SITE_TYPE_LABELS,
  SORT_OPTIONS,
  THEME_OPTIONS,
} from "@/lib/constants";
import {
  Amenity,
  CampgroundCertification,
  CampgroundOperationType,
  SiteType,
} from "@/types/domain";
import { MapPin, X } from "lucide-react";
import { useState } from "react";

type CampgroundFiltersProps = {
  onApply: (filters: FilterValues) => void;
  onClose: () => void;
};

export type FilterValues = {
  priceRange?: { min: number; max: number };
  amenities: Amenity[];
  siteTypes: SiteType[];
  capacity?: number;
  region?: string;
  theme?: string;
  sortBy?: string;
  operationTypes: CampgroundOperationType[];
  certifications: CampgroundCertification[];
};

const SITE_TYPES: { value: SiteType; label: string }[] = (
  Object.keys(SITE_TYPE_LABELS) as SiteType[]
).map((key) => ({
  value: key,
  label: SITE_TYPE_LABELS[key],
}));

/**
 * CampgroundFilters 컴포넌트
 *
 * @param onApply - 필터 적용 콜백
 * @param onClose - 필터 닫기 콜백
 */
export function CampgroundFilters({
  onApply,
  onClose,
}: CampgroundFiltersProps) {
  const [selectedPriceRange, setSelectedPriceRange] = useState<{
    min: number;
    max: number;
  } | null>(null);
  const [selectedAmenities, setSelectedAmenities] = useState<Amenity[]>([]);
  const [selectedSiteTypes, setSelectedSiteTypes] = useState<SiteType[]>([]);
  const [selectedCapacity, setSelectedCapacity] = useState<number | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [selectedSort, setSelectedSort] = useState<string>("createdAt");
  const [selectedOperationTypes, setSelectedOperationTypes] = useState<
    CampgroundOperationType[]
  >([]);
  const [selectedCertifications, setSelectedCertifications] = useState<
    CampgroundCertification[]
  >([]);

  const handleAmenityToggle = (amenity: Amenity) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity]
    );
  };

  const handleSiteTypeToggle = (siteType: SiteType) => {
    setSelectedSiteTypes((prev) =>
      prev.includes(siteType)
        ? prev.filter((t) => t !== siteType)
        : [...prev, siteType]
    );
  };

  const handleOperationTypeToggle = (operationType: CampgroundOperationType) => {
    setSelectedOperationTypes((prev) =>
      prev.includes(operationType)
        ? prev.filter((t) => t !== operationType)
        : [...prev, operationType]
    );
  };

  const handleCertificationToggle = (
    certification: CampgroundCertification
  ) => {
    setSelectedCertifications((prev) =>
      prev.includes(certification)
        ? prev.filter((c) => c !== certification)
        : [...prev, certification]
    );
  };

  const handleReset = () => {
    setSelectedPriceRange(null);
    setSelectedAmenities([]);
    setSelectedSiteTypes([]);
    setSelectedCapacity(null);
    setSelectedRegion(null);
    setSelectedTheme(null);
    setSelectedSort("createdAt");
    setSelectedOperationTypes([]);
    setSelectedCertifications([]);
  };

  const handleApply = () => {
    onApply({
      priceRange: selectedPriceRange || undefined,
      amenities: selectedAmenities,
      siteTypes: selectedSiteTypes,
      capacity: selectedCapacity || undefined,
      region: selectedRegion || undefined,
      theme: selectedTheme || undefined,
      sortBy: selectedSort,
      operationTypes: selectedOperationTypes,
      certifications: selectedCertifications,
    });
    onClose();
  };

  const activeFilterCount =
    (selectedPriceRange ? 1 : 0) +
    selectedAmenities.length +
    selectedSiteTypes.length +
    (selectedCapacity ? 1 : 0) +
    (selectedRegion ? 1 : 0) +
    (selectedTheme ? 1 : 0) +
    selectedOperationTypes.length +
    selectedCertifications.length;

  return (
    <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose}>
      <div
        className="absolute right-0 bottom-0 left-0 max-h-[90vh] overflow-y-auto rounded-t-2xl bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-4 py-4">
          <h2 className="text-lg font-semibold">필터</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-neutral-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* 필터 내용 */}
        <div className="p-4">
          {/* 정렬 */}
          <section className="mb-6">
            <h3 className="mb-3 font-medium">정렬</h3>
            <div className="flex flex-wrap gap-2">
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedSort(option.value)}
                  className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                    selectedSort === option.value
                      ? "border-primary bg-primary text-white"
                      : "hover:border-primary border-neutral-300"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </section>

          {/* 지역 */}
          <section className="mb-6">
            <h3 className="mb-3 flex items-center gap-1 font-medium">
              <MapPin size={16} />
              지역
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {REGION_OPTIONS.map((region) => (
                <button
                  key={region.value}
                  onClick={() =>
                    setSelectedRegion(
                      selectedRegion === region.value ? null : region.value
                    )
                  }
                  className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                    selectedRegion === region.value
                      ? "border-primary bg-primary text-white"
                      : "hover:border-primary border-neutral-300"
                  }`}
                >
                  {region.label}
                </button>
              ))}
            </div>
          </section>

          {/* 가격대 */}
          <section className="mb-6">
            <h3 className="mb-3 font-medium">가격대</h3>
            <div className="grid grid-cols-2 gap-2">
              {PRICE_RANGES.map((range) => (
                <button
                  key={range.label}
                  onClick={() =>
                    setSelectedPriceRange(
                      selectedPriceRange?.min === range.min &&
                        selectedPriceRange?.max === range.max
                        ? null
                        : { min: range.min, max: range.max }
                    )
                  }
                  className={`rounded-lg border px-4 py-2 text-sm transition-colors ${
                    selectedPriceRange?.min === range.min &&
                    selectedPriceRange?.max === range.max
                      ? "border-primary bg-primary text-white"
                      : "hover:border-primary border-neutral-300"
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </section>

          {/* 테마 */}
          <section className="mb-6">
            <h3 className="mb-3 font-medium">테마</h3>
            <div className="grid grid-cols-2 gap-2">
              {THEME_OPTIONS.map((theme) => (
                <button
                  key={theme.value}
                  onClick={() =>
                    setSelectedTheme(
                      selectedTheme === theme.value ? null : theme.value
                    )
                  }
                  className={`rounded-lg border px-4 py-2 text-sm transition-colors ${
                    selectedTheme === theme.value
                      ? "border-primary bg-primary text-white"
                      : "hover:border-primary border-neutral-300"
                  }`}
                >
                  <span className="mr-1">{theme.emoji}</span>
                  {theme.label}
                </button>
              ))}
            </div>
          </section>

          {/* 편의시설 - 카테고리별 */}
          <section className="mb-6">
            <h3 className="mb-3 font-medium">편의시설</h3>
            {Object.entries(AMENITY_CATEGORIES).map(([key, category]) => (
              <div key={key} className="mb-4">
                <h4 className="mb-2 text-sm font-medium text-gray-600">
                  {category.label}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {category.amenities.map((amenity) => (
                    <button
                      key={amenity}
                      onClick={() => handleAmenityToggle(amenity)}
                      className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                        selectedAmenities.includes(amenity)
                          ? "border-primary bg-primary text-white"
                          : "hover:border-primary border-neutral-300"
                      }`}
                    >
                      {AMENITY_LABELS[amenity]}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </section>

          {/* 캠핑 타입 */}
          <section className="mb-6">
            <h3 className="mb-3 font-medium">캠핑 타입</h3>
            <div className="grid grid-cols-3 gap-2">
              {SITE_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => handleSiteTypeToggle(type.value)}
                  className={`rounded-lg border px-4 py-2 text-sm transition-colors ${
                    selectedSiteTypes.includes(type.value)
                      ? "border-primary bg-primary text-white"
                      : "hover:border-primary border-neutral-300"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </section>

          {/* 운영 주체 */}
          <section className="mb-6">
            <h3 className="mb-3 font-medium">운영 주체</h3>
            <div className="grid grid-cols-2 gap-2">
              {OPERATION_TYPE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleOperationTypeToggle(option.value)}
                  className={`rounded-lg border px-4 py-2 text-sm transition-colors ${
                    selectedOperationTypes.includes(option.value)
                      ? "border-primary bg-primary text-white"
                      : "hover:border-primary border-neutral-300"
                  }`}
                  title={option.description}
                >
                  <span className="mr-1">{option.emoji}</span>
                  {option.label}
                </button>
              ))}
            </div>
          </section>

          {/* 인증/등급 */}
          <section className="mb-6">
            <h3 className="mb-3 font-medium">인증/등급</h3>
            <div className="grid grid-cols-2 gap-2">
              {CERTIFICATION_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleCertificationToggle(option.value)}
                  className={`rounded-lg border px-4 py-2 text-sm transition-colors ${
                    selectedCertifications.includes(option.value)
                      ? "border-primary bg-primary text-white"
                      : "hover:border-primary border-neutral-300"
                  }`}
                  title={option.description}
                >
                  <span className="mr-1">{option.emoji}</span>
                  {option.label}
                </button>
              ))}
            </div>
          </section>

          {/* 인원 수 */}
          <section className="mb-6">
            <h3 className="mb-3 font-medium">인원 수</h3>
            <div className="grid grid-cols-4 gap-2">
              {CAPACITY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() =>
                    setSelectedCapacity(
                      selectedCapacity === option.value ? null : option.value
                    )
                  }
                  className={`rounded-lg border px-4 py-2 text-sm transition-colors ${
                    selectedCapacity === option.value
                      ? "border-primary bg-primary text-white"
                      : "hover:border-primary border-neutral-300"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* 푸터 */}
        <div className="sticky bottom-14 flex gap-2 border-t bg-white p-4">
          <Button variant="outline" onClick={handleReset} className="flex-1">
            초기화
          </Button>
          <Button onClick={handleApply} className="flex-1">
            적용 {activeFilterCount > 0 && `(${activeFilterCount})`}
          </Button>
        </div>

        {/* Bottom Navigation 여백 */}
        <div className="h-14" />
      </div>
    </div>
  );
}
