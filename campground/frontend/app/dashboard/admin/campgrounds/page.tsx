"use client";

import { ExcelDownloadButton } from "@/components/common/ExcelDownloadButton";
import { CategoryBadges } from "@/components/features/campgrounds/CategoryBadges";
import { AdminDashboardNav } from "@/components/features/dashboard";
import { withAdminAuth } from "@/components/hoc";
import { Alert, AlertDescription, EmptyState, Image } from "@/components/ui";
import { Select } from "@/components/ui/Select";
import { useAllCampgrounds } from "@/hooks";
import { useToast } from "@/hooks/ui/useToast";
import { ApiError, NetworkError } from "@/lib/api/errors";
import {
  Calendar,
  CheckCircle,
  Clock,
  Filter,
  MapPin,
  Search,
  Store,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

/**
 * 캠핑장 관리 페이지
 * 전체 캠핑장 목록 조회 및 승인 관리
 */
function AdminCampgroundsPage() {
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "PENDING" | "APPROVED" | "REJECTED"
  >("ALL");

  const { campgrounds, isLoading, error, deleteCampground } = useAllCampgrounds(
    {
      search: searchQuery || undefined,
      status:
        statusFilter !== "ALL"
          ? (statusFilter as "PENDING" | "APPROVED" | "REJECTED")
          : undefined,
    }
  );

  /**
   * 캠핑장 삭제
   */
  const handleDelete = async (id: number, name: string) => {
    if (
      !confirm(
        `"${name}" 캠핑장을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`
      )
    ) {
      return;
    }

    try {
      await deleteCampground(id);
      toast.success("삭제되었습니다");
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404) {
          toast.error("캠핑장을 찾을 수 없습니다");
        } else if (error.status === 403) {
          toast.error("삭제 권한이 없습니다");
        } else if (error.status >= 500) {
          toast.error("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요");
        } else {
          toast.error("삭제에 실패했습니다");
        }
      } else if (error instanceof NetworkError) {
        toast.error("네트워크 연결을 확인해주세요");
      } else {
        console.error(error);
        toast.error("삭제에 실패했습니다");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="text-gray-600">캠핑장 목록 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center text-red-600">
          <p>캠핑장 목록을 불러오는데 실패했습니다.</p>
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

  const campgroundList = campgrounds?.content || [];
  const totalCampgrounds = campgrounds?.totalElements || 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-14">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b bg-white shadow-sm">
        <div className="px-3 py-3 sm:px-4 sm:py-4">
          <div className="mb-3 flex items-start justify-between gap-2">
            <div className="flex-1">
              <h1 className="text-xl font-bold sm:text-2xl">캠핑장 관리</h1>
              <p className="mt-0.5 text-xs text-gray-600 sm:text-sm">
                전체 {totalCampgrounds.toLocaleString()}개
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
              <ExcelDownloadButton
                data={campgroundList}
                filename="캠핑장목록"
                sheetName="캠핑장"
                disabled={campgroundList.length === 0}
              />
              <Store className="h-6 w-6 text-green-600 sm:h-8 sm:w-8" />
            </div>
          </div>

          {/* 검색 */}
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400 sm:h-5 sm:w-5" />
            <input
              type="text"
              placeholder="캠핑장 이름으로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border py-2.5 pr-3 pl-9 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none sm:py-2 sm:pl-10"
            />
          </div>
        </div>
      </div>

      {/* Dashboard Navigation */}
      <AdminDashboardNav />

      <div className="space-y-3 p-3 sm:space-y-4 sm:p-4">
        {/* 필터 */}
        <div className="rounded-lg border bg-white p-3 sm:p-4">
          <div className="mb-2.5 flex items-center gap-2 sm:mb-3">
            <Filter className="h-4 w-4 text-gray-600 sm:h-5 sm:w-5" />
            <h2 className="text-sm font-semibold sm:text-base">필터</h2>
          </div>

          <div>
            <Select
              label="승인 상태"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value as "ALL" | "PENDING" | "APPROVED" | "REJECTED"
                )
              }
              options={[
                { value: "ALL", label: "전체" },
                { value: "PENDING", label: "승인 대기" },
                { value: "APPROVED", label: "승인됨" },
                { value: "REJECTED", label: "거부됨" },
              ]}
            />
          </div>
        </div>

        {/* 통계 */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-4">
          <div className="rounded-lg border bg-white p-3 sm:p-4">
            <p className="text-xs text-gray-600 sm:text-sm">승인 대기</p>
            <p className="mt-0.5 text-xl font-bold text-orange-600 sm:mt-1 sm:text-2xl">
              {
                campgroundList.filter((c) => c.approvalStatus === "PENDING")
                  .length
              }
            </p>
          </div>
          <div className="rounded-lg border bg-white p-3 sm:p-4">
            <p className="text-xs text-gray-600 sm:text-sm">승인됨</p>
            <p className="mt-0.5 text-xl font-bold text-green-600 sm:mt-1 sm:text-2xl">
              {
                campgroundList.filter((c) => c.approvalStatus === "APPROVED")
                  .length
              }
            </p>
          </div>
          <div className="rounded-lg border bg-white p-3 sm:p-4">
            <p className="text-xs text-gray-600 sm:text-sm">거부됨</p>
            <p className="mt-0.5 text-xl font-bold text-red-600 sm:mt-1 sm:text-2xl">
              {
                campgroundList.filter((c) => c.approvalStatus === "REJECTED")
                  .length
              }
            </p>
          </div>
          <div className="rounded-lg border bg-white p-3 sm:p-4">
            <p className="text-xs text-gray-600 sm:text-sm">운영 중</p>
            <p className="mt-0.5 text-xl font-bold text-blue-600 sm:mt-1 sm:text-2xl">
              {campgroundList.filter((c) => c.status === "ACTIVE").length}
            </p>
          </div>
        </div>

        {/* 캠핑장 목록 */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
              <p className="text-gray-600">캠핑장 목록을 불러오는 중...</p>
            </div>
          </div>
        ) : error ? (
          <Alert variant="error">
            <AlertDescription>
              캠핑장 목록을 불러오는데 실패했습니다.
            </AlertDescription>
          </Alert>
        ) : campgroundList.length === 0 ? (
          <EmptyState
            icon={<Store className="h-full w-full" />}
            title="캠핑장이 없습니다"
            variant="bordered"
          />
        ) : (
          <div className="space-y-2.5 sm:space-y-3">
            {campgroundList.map((campground) => (
              <div
                key={campground.id}
                className="overflow-hidden rounded-lg border bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                <Link href={`/campgrounds/${campground.id}`} className="block">
                  <div className="flex gap-3 p-3 sm:gap-4 sm:p-4">
                    {/* 썸네일 */}
                    {campground.thumbnailUrls && campground.thumbnailUrls[0] ? (
                      <Image
                        src={campground.thumbnailUrls[0]}
                        alt={campground.name}
                        width={80}
                        height={80}
                        fallback="/images/fallback-image.svg"
                        aspectRatio="square"
                        objectFit="cover"
                        rounded="lg"
                        className="h-20 w-20 shrink-0 sm:h-24 sm:w-24"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-gray-100 sm:h-24 sm:w-24">
                        <Store className="h-6 w-6 text-gray-300 sm:h-8 sm:w-8" />
                      </div>
                    )}

                    {/* 정보 */}
                    <div className="min-w-0 flex-1">
                      <div className="mb-1.5 flex items-start justify-between gap-2 sm:mb-2">
                        <h3 className="line-clamp-1 text-sm font-semibold text-gray-900 sm:text-base">
                          {campground.name}
                        </h3>
                        <div className="shrink-0">
                          {getStatusBadge(campground.status)}
                        </div>
                      </div>

                      <div className="mb-1 flex items-start gap-1 text-xs text-gray-600 sm:text-sm">
                        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                        <span className="line-clamp-1">
                          {campground.address}
                        </span>
                      </div>

                      {/* Category Badges */}
                      {(campground.operationType || campground.certification) && (
                        <div className="mb-1.5 sm:mb-2">
                          <CategoryBadges
                            operationType={campground.operationType}
                            certification={campground.certification}
                            size="sm"
                          />
                        </div>
                      )}

                      <div className="flex items-center gap-1 text-xs text-gray-500 sm:text-sm">
                        <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        <span>
                          등록:{" "}
                          {new Date(campground.createdAt).toLocaleDateString(
                            "ko-KR"
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>

                {/* 삭제 버튼 - 모든 상태에서 사용 가능 */}
                <div className="border-t bg-gray-50 p-2.5 sm:p-3">
                  <button
                    onClick={() => handleDelete(campground.id, campground.name)}
                    className="w-full rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 active:bg-red-800 sm:text-base"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 페이지네이션 안내 */}
        {campgrounds && campgrounds.totalPages > 1 && (
          <div className="text-center text-sm text-gray-500">
            페이지 1 / {campgrounds.totalPages}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * 승인 상태 배지
 */
function getStatusBadge(status: string) {
  switch (status) {
    case "ACTIVE":
      return (
        <span className="inline-flex items-center gap-0.5 rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] font-medium text-green-800 sm:gap-1 sm:px-2 sm:py-1 sm:text-xs">
          <CheckCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
          <span className="whitespace-nowrap">운영 중</span>
        </span>
      );
    case "INACTIVE":
      return (
        <span className="inline-flex items-center gap-0.5 rounded-full bg-orange-100 px-1.5 py-0.5 text-[10px] font-medium text-orange-800 sm:gap-1 sm:px-2 sm:py-1 sm:text-xs">
          <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
          <span className="whitespace-nowrap">휴업</span>
        </span>
      );
    case "MAINTENANCE":
      return (
        <span className="inline-flex items-center gap-0.5 rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-800 sm:gap-1 sm:px-2 sm:py-1 sm:text-xs">
          <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
          <span className="whitespace-nowrap">정비 중</span>
        </span>
      );
    case "CLOSED":
      return (
        <span className="inline-flex items-center gap-0.5 rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-800 sm:gap-1 sm:px-2 sm:py-1 sm:text-xs">
          <XCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
          <span className="whitespace-nowrap">폐업</span>
        </span>
      );
    default:
      return null;
  }
}

export default withAdminAuth(AdminCampgroundsPage);
