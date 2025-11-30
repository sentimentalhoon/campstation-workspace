/**
 * 찜 목록 페이지
 *
 * @see docs/sprints/sprint-4.md
 * @see docs/sprints/sprint-5.md - P2-2: 찜하기 개선
 * @see docs/specifications/03-PAGES.md
 */

"use client";

import { QueryStateHandler } from "@/components/common";
import { DashboardNav } from "@/components/features/dashboard";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui";
import { useAllFavorites, useToggleFavorite } from "@/hooks";
import { ROUTES, SORT_OPTIONS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { ArrowUpDown, Heart, MapPin } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type FavoriteSortOption =
  | "latest"
  | "name"
  | "rating"
  | "price_asc"
  | "price_desc"
  | "createdAt";

/**
 * 찜 목록 페이지
 *
 * - 사용자가 찜한 캠핑장 목록 표시
 * - CampgroundCard 컴포넌트 재사용
 * - 빈 상태 처리
 */
export default function FavoritesPage() {
  // ============================================================
  // 1. Hooks
  // ============================================================
  const router = useRouter();
  const { data, isLoading, error } = useAllFavorites();
  const [sortBy, setSortBy] = useState<FavoriteSortOption>("latest");
  const toggleFavorite = useToggleFavorite();

  // ============================================================
  // 2. Event Handlers
  // ============================================================
  const handleBack = () => router.back();

  const handleSortChange = (option: FavoriteSortOption) => {
    setSortBy(option);
  };

  const handleRemoveFavorite = (
    e: React.MouseEvent,
    campgroundId: number,
    campgroundName: string
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (confirm(`"${campgroundName}"을(를) 찜 목록에서 제거하시겠습니까?`)) {
      toggleFavorite.mutate({ campgroundId });
    }
  };

  // ============================================================
  // 3. Computed Values
  // ============================================================
  // React Compiler가 자동으로 메모이제이션 처리
  const favorites = data || [];

  // 정렬된 찜 목록
  const sorted = [...favorites];
  const sortedFavorites = (() => {
    switch (sortBy) {
      case "latest":
      case "createdAt":
        // 최신순 (createdAt 내림차순)
        return sorted.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case "name":
        // 이름순 (가나다순)
        return sorted.sort((a, b) =>
          a.campgroundName.localeCompare(b.campgroundName, "ko")
        );
      case "rating":
      case "price_asc":
      case "price_desc":
        // Favorite 타입에는 rating, price 정보가 없으므로 기본 정렬 유지
        // TODO: 백엔드 API에서 캠핑장 상세 정보를 포함하도록 개선 필요
        return sorted;
      default:
        return sorted;
    }
  })();

  // ============================================================
  // 4. Render
  // ============================================================

  return (
    <div className="min-h-screen bg-neutral-50 pb-14">
      {/* Header */}
      <PageHeader
        title="찜 목록"
        showBack
        onBack={handleBack}
        rightAction={
          !isLoading &&
          !error && (
            <span
              className="text-sm text-neutral-600"
              aria-label={`찜한 캠핑장 ${favorites.length}개`}
            >
              {favorites.length}개
            </span>
          )
        }
      />

      {/* Dashboard Navigation */}
      <DashboardNav />

      {/* Content with State Handling */}
      <div className="px-4 py-6">
        <QueryStateHandler
          isLoading={isLoading}
          loadingText="찜 목록을 불러오는 중..."
          error={error}
          errorTitle="찜 목록을 불러올 수 없습니다"
          isEmpty={favorites.length === 0}
          emptyTitle="찜한 캠핑장이 없습니다"
          emptyMessage="마음에 드는 캠핑장을 찜해보세요"
          emptyIcon={<Heart size={40} className="stroke-neutral-400" />}
          emptyAction={
            <Link href={ROUTES.CAMPGROUNDS.LIST}>
              <Button variant="primary">캠핑장 둘러보기</Button>
            </Link>
          }
        >
          {/* 정렬 옵션 */}
          {favorites.length > 0 && (
            <div className="mb-4 flex items-center justify-between border-b border-neutral-200 pb-3">
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <ArrowUpDown className="h-4 w-4" />
                <span>정렬:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() =>
                      handleSortChange(option.value as FavoriteSortOption)
                    }
                    className={`rounded-full px-3 py-1 text-sm transition-colors ${
                      sortBy === option.value
                        ? "bg-primary-500 text-white"
                        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 찜 목록 */}
          <div className="space-y-4" role="list" aria-label="찜한 캠핑장 목록">
            {sortedFavorites.map((favorite) => (
              <Link
                key={favorite.id}
                href={ROUTES.CAMPGROUNDS.DETAIL(favorite.campgroundId)}
                className="block"
              >
                <div
                  className="group hover:ring-primary-400 relative overflow-hidden rounded-2xl bg-white p-5 shadow-sm ring-1 ring-neutral-200 transition-all hover:shadow-md hover:ring-2"
                  role="listitem"
                >
                  {/* 찜 제거 버튼 */}
                  <button
                    onClick={(e) =>
                      handleRemoveFavorite(
                        e,
                        favorite.campgroundId,
                        favorite.campgroundName
                      )
                    }
                    className="absolute top-4 right-4 z-10 rounded-full bg-white p-2 shadow-md transition-all hover:bg-red-50 hover:shadow-lg"
                    aria-label="찜 제거"
                  >
                    <Heart className="h-5 w-5 fill-red-500 text-red-500 transition-colors hover:fill-red-600 hover:text-red-600" />
                  </button>

                  {/* 캠핑장 정보 */}
                  <div className="pr-12">
                    <h3 className="group-hover:text-primary-600 mb-2 text-lg font-bold text-neutral-900">
                      {favorite.campgroundName}
                    </h3>

                    <div className="mb-3 flex items-start gap-2 text-neutral-600">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                      <p className="line-clamp-2 text-sm">
                        {favorite.campgroundAddress}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-xs text-neutral-500">
                        {formatDate(favorite.createdAt)} 추가
                      </p>

                      <div className="bg-primary-50 text-primary-700 rounded-full px-3 py-1 text-xs font-medium">
                        자세히 보기 →
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </QueryStateHandler>
      </div>
    </div>
  );
}
