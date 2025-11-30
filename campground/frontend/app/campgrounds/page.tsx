/**
 * 캠핑장 리스트 페이지
 * 06-SCREEN-LAYOUTS.md 명세 준수
 *
 * 레이아웃:
 * - Header (sticky): 56px
 * - Search Bar: 44px (padding 8px)
 * - Filter Chips: 40px (MVP 제외)
 * - Campground Cards: space-y-4 (16px gap)
 * - Bottom Tab Nav: 56px
 */

"use client";

import {
  CampgroundCard,
  CampgroundFilters,
  FilterValues,
} from "@/components/features/campgrounds";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button, CampgroundCardSkeleton } from "@/components/ui";
import { useSearchHistory } from "@/hooks";
import { campgroundApi } from "@/lib/api";
import { AMENITY_LABELS, SITE_TYPE_LABELS } from "@/lib/constants";
import { useQuery } from "@tanstack/react-query";
import { Clock, Filter, Search, X } from "lucide-react";
import { useState } from "react";

export default function CampgroundsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0); // Backend uses 0-based pagination
  const [showFilters, setShowFilters] = useState(false);
  const [showSearchHistory, setShowSearchHistory] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterValues>({
    amenities: [],
    siteTypes: [],
    operationTypes: [],
    certifications: [],
  });

  const { history, addSearchTerm, removeSearchTerm, clearHistory } =
    useSearchHistory();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["campgrounds", { page, search: searchQuery, ...activeFilters }],
    queryFn: () =>
      campgroundApi.getAll({
        page,
        size: 10,
        location: searchQuery || undefined,
        minPrice: activeFilters.priceRange?.min,
        maxPrice: activeFilters.priceRange?.max,
        amenities: activeFilters.amenities,
        siteTypes: activeFilters.siteTypes,
        minCapacity: activeFilters.capacity,
      }),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      addSearchTerm(searchQuery.trim());
      setShowSearchHistory(false);
    }
    setPage(0);
    refetch();
  };

  const handleHistoryClick = (term: string) => {
    setSearchQuery(term);
    setShowSearchHistory(false);
    setPage(0);
  };

  const handleApplyFilters = (filters: FilterValues) => {
    setActiveFilters(filters);
    setPage(0);
  };

  const handleRemoveFilter = (
    type: "price" | "amenity" | "siteType" | "capacity" | "region" | "theme",
    value?: string
  ) => {
    if (type === "price") {
      setActiveFilters((prev) => ({ ...prev, priceRange: undefined }));
    } else if (type === "amenity" && value) {
      setActiveFilters((prev) => ({
        ...prev,
        amenities: prev.amenities.filter((a) => a !== value),
      }));
    } else if (type === "siteType" && value) {
      setActiveFilters((prev) => ({
        ...prev,
        siteTypes: prev.siteTypes.filter((t) => t !== value),
      }));
    } else if (type === "capacity") {
      setActiveFilters((prev) => ({ ...prev, capacity: undefined }));
    } else if (type === "region") {
      setActiveFilters((prev) => ({ ...prev, region: undefined }));
    } else if (type === "theme") {
      setActiveFilters((prev) => ({ ...prev, theme: undefined }));
    }
    setPage(0);
  };

  const activeFilterCount =
    (activeFilters.priceRange ? 1 : 0) +
    activeFilters.amenities.length +
    activeFilters.siteTypes.length +
    (activeFilters.capacity ? 1 : 0) +
    (activeFilters.region ? 1 : 0) +
    (activeFilters.theme ? 1 : 0);

  return (
    <div className="min-h-screen">
      {/* Header - sticky, 56px */}
      <PageHeader
        title="캠핑장 찾기"
        rightAction={
          <button
            onClick={() => setShowFilters(true)}
            className="relative text-xl"
          >
            <Filter size={24} />
            {activeFilterCount > 0 && (
              <span className="bg-primary absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] text-white">
                {activeFilterCount}
              </span>
            )}
          </button>
        }
      />

      {/* Search Bar - 44px with 8px padding */}
      <div className="sticky top-14 z-10 bg-white px-4 py-2 shadow-sm">
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            placeholder="지역으로 검색 (예: 서울, 제주)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setShowSearchHistory(true)}
            className="focus:border-primary h-10 w-full rounded-lg border border-neutral-300 px-4 pr-10 text-sm focus:outline-none"
          />
          <button
            type="submit"
            className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full p-1.5 hover:bg-neutral-100"
          >
            <Search size={18} className="text-neutral-600" />
          </button>

          {/* 검색 히스토리 */}
          {showSearchHistory && history.length > 0 && (
            <div className="absolute top-full right-0 left-0 mt-1 rounded-lg border bg-white shadow-lg">
              <div className="flex items-center justify-between border-b px-4 py-2">
                <h3 className="text-sm font-medium text-neutral-700">
                  최근 검색어
                </h3>
                <button
                  type="button"
                  onClick={clearHistory}
                  className="text-xs text-neutral-500 hover:text-neutral-700"
                >
                  전체 삭제
                </button>
              </div>
              <div className="max-h-60 overflow-y-auto">
                {history.map((term, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between px-4 py-2 hover:bg-neutral-50"
                  >
                    <button
                      type="button"
                      onClick={() => handleHistoryClick(term)}
                      className="flex flex-1 items-center gap-2 text-left text-sm"
                    >
                      <Clock size={16} className="text-neutral-400" />
                      <span>{term}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => removeSearchTerm(term)}
                      className="rounded-full p-1 hover:bg-neutral-200"
                    >
                      <X size={14} className="text-neutral-500" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Filter Chips - 40px */}
      {activeFilterCount > 0 && (
        <div className="sticky top-28 z-10 bg-white px-4 py-2">
          <div className="flex flex-wrap gap-2">
            {/* 지역 칩 */}
            {activeFilters.region && (
              <button
                onClick={() => handleRemoveFilter("region")}
                className="border-primary bg-primary/10 text-primary flex items-center gap-1 rounded-full border px-3 py-1 text-sm"
              >
                📍 {activeFilters.region}
                <X size={14} />
              </button>
            )}

            {/* 테마 칩 */}
            {activeFilters.theme && (
              <button
                onClick={() => handleRemoveFilter("theme")}
                className="border-primary bg-primary/10 text-primary flex items-center gap-1 rounded-full border px-3 py-1 text-sm"
              >
                {activeFilters.theme}
                <X size={14} />
              </button>
            )}

            {/* 가격대 칩 */}
            {activeFilters.priceRange && (
              <button
                onClick={() => handleRemoveFilter("price")}
                className="border-primary bg-primary/10 text-primary flex items-center gap-1 rounded-full border px-3 py-1 text-sm"
              >
                {activeFilters.priceRange.min.toLocaleString()}원 ~{" "}
                {activeFilters.priceRange.max.toLocaleString()}원
                <X size={14} />
              </button>
            )}

            {/* 편의시설 칩 */}
            {activeFilters.amenities.map((amenity) => (
              <button
                key={amenity}
                onClick={() => handleRemoveFilter("amenity", amenity)}
                className="border-primary bg-primary/10 text-primary flex items-center gap-1 rounded-full border px-3 py-1 text-sm"
              >
                {AMENITY_LABELS[amenity]}
                <X size={14} />
              </button>
            ))}

            {/* 캠핑 타입 칩 */}
            {activeFilters.siteTypes.map((type) => (
              <button
                key={type}
                onClick={() => handleRemoveFilter("siteType", type)}
                className="border-primary bg-primary/10 text-primary flex items-center gap-1 rounded-full border px-3 py-1 text-sm"
              >
                {SITE_TYPE_LABELS[type]}
                <X size={14} />
              </button>
            ))}

            {/* 인원 수 칩 */}
            {activeFilters.capacity && (
              <button
                onClick={() => handleRemoveFilter("capacity")}
                className="border-primary bg-primary/10 text-primary flex items-center gap-1 rounded-full border px-3 py-1 text-sm"
              >
                {activeFilters.capacity}인 이상
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Content - 16px padding */}
      <main className="px-4 py-6">
        {/* Results Count - 32px */}
        {!isLoading && !error && data && (
          <p className="mb-4 text-sm text-neutral-600">
            총 {data.totalElements.toLocaleString()}개 캠핑장
          </p>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <CampgroundCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <div className="mb-4 text-4xl">⚠️</div>
              <p className="mb-2 text-neutral-700">
                캠핑장 목록을 불러올 수 없습니다
              </p>
              <Button onClick={() => refetch()} variant="outline" size="sm">
                다시 시도
              </Button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && data?.content.length === 0 && (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <div className="mb-2 text-4xl">🏕️</div>
              <p className="text-neutral-500">검색 결과가 없습니다</p>
            </div>
          </div>
        )}

        {/* Campground List - space-y-4 (16px gap) */}
        {!isLoading && !error && data && data.content.length > 0 && (
          <div className="space-y-4">
            {data.content.map((campground) => (
              <CampgroundCard key={campground.id} campground={campground} />
            ))}
          </div>
        )}

        {/* Pagination - 56px */}
        {!isLoading && !error && data && data.totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              이전
            </Button>

            <span className="min-w-20 text-center text-sm text-neutral-600">
              {page + 1} / {data.totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setPage((p) => Math.min(data.totalPages - 1, p + 1))
              }
              disabled={page >= data.totalPages - 1}
            >
              다음
            </Button>
          </div>
        )}
      </main>

      {/* 하단 여백 - Bottom Nav 높이만큼 */}
      <div className="h-[120px]" />

      {/* 필터 모달 */}
      {showFilters && (
        <CampgroundFilters
          onApply={handleApplyFilters}
          onClose={() => setShowFilters(false)}
        />
      )}
    </div>
  );
}
