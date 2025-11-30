"use client";

import { ExcelDownloadButton } from "@/components/common/ExcelDownloadButton";
import { BannerTable } from "@/components/features/admin/BannerTable/BannerTable";
import { AdminDashboardNav } from "@/components/features/dashboard";
import { withAdminAuth } from "@/components/hoc";
import { Select } from "@/components/ui/Select";
import { useAdminBanners, useBannerStats } from "@/hooks";
import { BannerSearchParams } from "@/types";
import { BarChart3, Filter, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

/**
 * 배너 관리 페이지
 * 배너 목록 조회 및 CRUD 관리
 */
function AdminBannersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<
    "ALL" | "PROMOTION" | "EVENT" | "ANNOUNCEMENT" | "NOTICE"
  >("ALL");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "ACTIVE" | "INACTIVE" | "SCHEDULED"
  >("ALL");

  // 검색 파라미터 구성
  const searchParams: BannerSearchParams = {
    page: 0,
    size: 20,
    ...(searchQuery && { title: searchQuery }),
    ...(typeFilter !== "ALL" && { type: typeFilter }),
    ...(statusFilter !== "ALL" && { status: statusFilter }),
    sort: "displayOrder",
    direction: "asc",
  };

  const { data: banners, isLoading, error } = useAdminBanners(searchParams);
  const { data: stats } = useBannerStats();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="text-gray-600">배너 목록 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center text-red-600">
          <p>배너 목록을 불러오는데 실패했습니다.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  const bannerList = banners?.content || [];
  const totalBanners = banners?.totalElements || 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-14">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b bg-white">
        <div className="px-4 py-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">배너 관리</h1>
              <p className="mt-1 text-sm text-gray-600">
                전체 {totalBanners.toLocaleString()}개
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ExcelDownloadButton
                data={bannerList}
                filename="배너목록"
                sheetName="배너"
                disabled={bannerList.length === 0}
              />
              <Link
                href="/dashboard/admin/banners/create"
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
              >
                <Plus className="h-5 w-5" />
                <span className="font-medium">추가</span>
              </Link>
            </div>
          </div>

          {/* 검색 */}
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="배너 제목으로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border py-2 pr-4 pl-10 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Dashboard Navigation */}
      <AdminDashboardNav />

      <div className="space-y-4 p-4">
        {/* 필터 */}
        <div className="rounded-lg border bg-white p-4">
          <div className="mb-3 flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-600" />
            <h2 className="font-semibold">필터</h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* 타입 필터 */}
            <Select
              label="타입"
              value={typeFilter}
              onChange={(e) =>
                setTypeFilter(
                  e.target.value as
                    | "ALL"
                    | "PROMOTION"
                    | "EVENT"
                    | "ANNOUNCEMENT"
                    | "NOTICE"
                )
              }
              options={[
                { value: "ALL", label: "전체" },
                { value: "PROMOTION", label: "프로모션" },
                { value: "EVENT", label: "이벤트" },
                { value: "ANNOUNCEMENT", label: "공지" },
                { value: "NOTICE", label: "안내" },
              ]}
            />

            {/* 상태 필터 */}
            <Select
              label="상태"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value as "ALL" | "ACTIVE" | "INACTIVE" | "SCHEDULED"
                )
              }
              options={[
                { value: "ALL", label: "전체" },
                { value: "ACTIVE", label: "활성" },
                { value: "INACTIVE", label: "비활성" },
                { value: "SCHEDULED", label: "예약됨" },
              ]}
            />
          </div>
        </div>

        {/* 통계 */}
        {stats && (
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border bg-white p-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm text-gray-600">활성 배너</p>
                <BarChart3 className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-600">
                {stats.activeBanners}
              </p>
            </div>
            <div className="rounded-lg border bg-white p-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm text-gray-600">전체 조회수</p>
                <BarChart3 className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-blue-600">
                {stats.totalViews.toLocaleString()}
              </p>
            </div>
            <div className="rounded-lg border bg-white p-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm text-gray-600">전체 클릭수</p>
                <BarChart3 className="h-5 w-5 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-purple-600">
                {stats.totalClicks.toLocaleString()}
              </p>
            </div>
            <div className="rounded-lg border bg-white p-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm text-gray-600">평균 CTR</p>
                <BarChart3 className="h-5 w-5 text-orange-600" />
              </div>
              <p className="text-2xl font-bold text-orange-600">
                {stats.averageCtr.toFixed(2)}%
              </p>
            </div>
          </div>
        )}

        {/* 배너 테이블 */}
        <BannerTable banners={bannerList} />

        {/* 페이지네이션 안내 */}
        {banners && banners.totalPages > 1 && (
          <div className="text-center text-sm text-gray-500">
            페이지 {banners.page + 1} / {banners.totalPages}
          </div>
        )}
      </div>
    </div>
  );
}

export default withAdminAuth(AdminBannersPage);
