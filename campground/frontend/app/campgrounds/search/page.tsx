/**
 * 캠핑장 검색 페이지
 *
 * @route /campgrounds/search
 */

"use client";

import { CampgroundCard } from "@/components/features/campgrounds";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button, ErrorMessage, LoadingSpinner } from "@/components/ui";
import { useSearchCampgrounds } from "@/hooks";
import { ROUTES } from "@/lib/constants";
import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL 파라미터에서 초기 값 가져오기
  const [keyword, setKeyword] = useState(searchParams.get("keyword") || "");
  const [minPrice, setMinPrice] = useState<number | undefined>(
    searchParams.get("minPrice")
      ? Number(searchParams.get("minPrice"))
      : undefined
  );
  const [maxPrice, setMaxPrice] = useState<number | undefined>(
    searchParams.get("maxPrice")
      ? Number(searchParams.get("maxPrice"))
      : undefined
  );
  const [page, setPage] = useState(
    searchParams.get("page") ? Number(searchParams.get("page")) : 0
  );

  // 검색 실행
  const { data, isLoading, error, refetch } = useSearchCampgrounds({
    keyword: keyword || undefined,
    minPrice,
    maxPrice,
    page,
    size: 10,
  });

  /**
   * URL 업데이트
   */
  const updateURL = () => {
    const params = new URLSearchParams();
    if (keyword) params.set("keyword", keyword);
    if (minPrice !== undefined) params.set("minPrice", minPrice.toString());
    if (maxPrice !== undefined) params.set("maxPrice", maxPrice.toString());
    params.set("page", page.toString());

    router.push(`${ROUTES.CAMPGROUNDS.SEARCH}?${params.toString()}`, {
      scroll: false,
    });
  };

  /**
   * 검색 실행
   */
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0); // 검색 시 첫 페이지로
    updateURL();
    refetch();
  };

  /**
   * 필터 초기화
   */
  const handleReset = () => {
    setKeyword("");
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setPage(0);
    router.push(ROUTES.CAMPGROUNDS.SEARCH);
    refetch();
  };

  // URL 변경 시 검색 자동 실행
  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const campgrounds = data?.content || [];
  const totalPages = data?.totalPages || 1;
  const totalElements = data?.totalElements || 0;

  return (
    <div className="min-h-screen pb-14">
      {/* Header */}
      <PageHeader
        title="캠핑장 검색"
        showBack
        onBack={() => router.push(ROUTES.CAMPGROUNDS.LIST)}
      />

      {/* 검색 폼 */}
      <div className="sticky top-14 z-10 bg-white px-4 py-4 shadow-sm">
        <form onSubmit={handleSearch} className="space-y-3">
          {/* 키워드 검색 */}
          <div className="relative">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="캠핑장 이름, 위치로 검색"
              className="focus:border-primary-500 focus:ring-primary-500/20 w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 focus:ring-2 focus:outline-none"
            />
            <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
          </div>

          {/* 가격 필터 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-gray-600">
                최소 가격
              </label>
              <input
                type="number"
                value={minPrice || ""}
                onChange={(e) =>
                  setMinPrice(
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
                placeholder="0"
                className="focus:border-primary-500 focus:ring-primary-500/20 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-600">
                최대 가격
              </label>
              <input
                type="number"
                value={maxPrice || ""}
                onChange={(e) =>
                  setMaxPrice(
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
                placeholder="무제한"
                className="focus:border-primary-500 focus:ring-primary-500/20 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:outline-none"
              />
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              className="flex-1"
            >
              초기화
            </Button>
            <Button type="submit" className="flex-1">
              검색
            </Button>
          </div>
        </form>
      </div>

      {/* 결과 */}
      <div className="px-4 py-4">
        {/* 결과 헤더 */}
        {!isLoading && (
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              총{" "}
              <span className="font-semibold text-gray-900">
                {totalElements}
              </span>
              개의 캠핑장
            </p>
          </div>
        )}

        {/* 로딩 */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {/* 에러 */}
        {error && (
          <ErrorMessage
            message="검색 중 오류가 발생했습니다"
            retry={() => refetch()}
          />
        )}

        {/* 결과 목록 */}
        {!isLoading && !error && campgrounds.length > 0 && (
          <div className="space-y-4">
            {campgrounds.map((campground) => (
              <CampgroundCard key={campground.id} campground={campground} />
            ))}
          </div>
        )}

        {/* 빈 상태 */}
        {!isLoading && !error && campgrounds.length === 0 && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 py-12 text-center">
            <p className="text-gray-600">검색 결과가 없습니다.</p>
            <p className="mt-2 text-sm text-gray-500">
              다른 키워드나 필터로 다시 검색해보세요.
            </p>
            <Button onClick={handleReset} className="mt-4">
              필터 초기화
            </Button>
          </div>
        )}

        {/* 페이지네이션 */}
        {!isLoading && !error && totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              이전
            </Button>
            <span className="text-sm text-gray-600">
              {page + 1} / {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
            >
              다음
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}
