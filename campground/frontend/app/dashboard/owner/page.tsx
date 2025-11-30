/**
 * OWNER 대시보드 메인 페이지
 * 내 캠핑장 목록 및 통계
 */

"use client";

import { CategoryBadges } from "@/components/features/campgrounds/CategoryBadges";
import { OwnerDashboardNav } from "@/components/features/dashboard";
import { withOwnerAuth } from "@/components/hoc";
import { Button } from "@/components/ui/Button";
import { ownerApi } from "@/lib/api/owner";
import { ROUTES } from "@/lib/constants";
import type { Campground } from "@/types";
import {
  Calendar,
  ChevronRight,
  DollarSign,
  MapPin,
  Plus,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface CampgroundStats {
  siteCount: number;
  pendingReservations: number;
}

function OwnerDashboardPage() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [campgrounds, setCampgrounds] = useState<Campground[]>([]);
  const [campgroundStats, setCampgroundStats] = useState<
    Record<number, CampgroundStats>
  >({});
  const [stats, setStats] = useState({
    totalReservations: 0,
    totalRevenue: 0,
    totalGuests: 0,
    occupancyRate: 0,
  });

  // 데이터 로드
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // 캠핑장 목록과 통계를 병렬로 가져오기
        const [campgroundsRes, statsRes] = await Promise.all([
          ownerApi.getMyCampgrounds({ page: 0, size: 20 }),
          ownerApi.getDashboardStats(),
        ]);

        const campgroundsList = campgroundsRes.content || [];
        setCampgrounds(campgroundsList);
        setStats({
          totalReservations: statsRes.totalReservations || 0,
          totalRevenue: statsRes.totalRevenue || 0,
          totalGuests: statsRes.totalGuests || 0,
          occupancyRate: statsRes.occupancyRate || 0,
        });

        // TODO: 백엔드 API에서 실제 데이터 가져오기
        // 각 캠핑장의 사이트 수와 대기중 예약 수
        const statsMap: Record<number, CampgroundStats> = {};
        campgroundsList.forEach((campground) => {
          statsMap[campground.id] = {
            siteCount: Math.floor(Math.random() * 20) + 5, // 5-25개
            pendingReservations: Math.floor(Math.random() * 10), // 0-10개
          };
        });
        setCampgroundStats(statsMap);
      } catch (error) {
        console.error("데이터 로드 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreateCampground = () => {
    router.push(ROUTES.DASHBOARD.OWNER_CAMPGROUNDS_NEW);
  };

  const handleEditCampground = (id: number) => {
    router.push(ROUTES.DASHBOARD.OWNER_CAMPGROUND_EDIT(id));
  };

  const handleManageSites = (id: number) => {
    router.push(ROUTES.DASHBOARD.OWNER_CAMPGROUND_SITES(id));
  };

  const handleViewReservations = (id: number) => {
    router.push(ROUTES.DASHBOARD.OWNER_CAMPGROUND_RESERVATIONS(id));
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
          <p className="text-sm font-medium text-gray-600">
            데이터 불러오는 중...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-indigo-50 pb-24">
      {/* Dashboard Navigation */}
      <OwnerDashboardNav />

      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="bg-linear-to-br from-blue-600 to-indigo-600 bg-clip-text text-3xl font-extrabold text-transparent sm:text-4xl">
            내 캠핑장
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            캠핑장 운영 현황을 한눈에 확인하세요
          </p>
        </div>

        {/* 통계 카드 - 모바일 최적화 */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <div className="group relative overflow-hidden rounded-2xl bg-white p-4 shadow-sm transition-all hover:shadow-md">
            <div className="absolute top-0 right-0 h-16 w-16 translate-x-6 -translate-y-6 rounded-full bg-blue-50 transition-transform group-hover:scale-110"></div>
            <Calendar className="relative mb-2 h-8 w-8 text-blue-600" />
            <p className="relative text-xs font-medium text-gray-600">예약</p>
            <p className="relative text-2xl font-bold text-gray-900">
              {stats.totalReservations}
            </p>
          </div>

          <div className="group relative overflow-hidden rounded-2xl bg-white p-4 shadow-sm transition-all hover:shadow-md">
            <div className="absolute top-0 right-0 h-16 w-16 translate-x-6 -translate-y-6 rounded-full bg-green-50 transition-transform group-hover:scale-110"></div>
            <DollarSign className="relative mb-2 h-8 w-8 text-green-600" />
            <p className="relative text-xs font-medium text-gray-600">매출</p>
            <p className="relative text-2xl font-bold text-gray-900">
              {(stats.totalRevenue / 1000000).toFixed(1)}M
            </p>
          </div>

          <div className="group relative overflow-hidden rounded-2xl bg-white p-4 shadow-sm transition-all hover:shadow-md">
            <div className="absolute top-0 right-0 h-16 w-16 translate-x-6 -translate-y-6 rounded-full bg-purple-50 transition-transform group-hover:scale-110"></div>
            <Users className="relative mb-2 h-8 w-8 text-purple-600" />
            <p className="relative text-xs font-medium text-gray-600">이용객</p>
            <p className="relative text-2xl font-bold text-gray-900">
              {stats.totalGuests}
            </p>
          </div>

          <div className="group relative overflow-hidden rounded-2xl bg-white p-4 shadow-sm transition-all hover:shadow-md">
            <div className="absolute top-0 right-0 h-16 w-16 translate-x-6 -translate-y-6 rounded-full bg-orange-50 transition-transform group-hover:scale-110"></div>
            <TrendingUp className="relative mb-2 h-8 w-8 text-orange-600" />
            <p className="relative text-xs font-medium text-gray-600">점유율</p>
            <p className="relative text-2xl font-bold text-gray-900">
              {stats.occupancyRate.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* 캠핑장 목록 */}
        <div className="mb-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">캠핑장 목록</h2>
              <p className="mt-1 text-xs text-gray-500">
                총 {campgrounds.length}개 운영중
              </p>
            </div>
            <Button
              onClick={handleCreateCampground}
              disabled={isLoading}
              size="sm"
              className="rounded-full shadow-lg"
            >
              <Plus className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">새 캠핑장</span>
            </Button>
          </div>

          {campgrounds.length === 0 ? (
            <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br from-blue-50 to-indigo-50">
                <Plus className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                첫 캠핑장을 등록해보세요
              </h3>
              <p className="mb-6 text-sm text-gray-500">
                캠핑장을 등록하고 예약 관리를 시작하세요
              </p>
              <Button
                onClick={handleCreateCampground}
                className="rounded-full shadow-lg"
              >
                <Plus className="mr-2 h-4 w-4" />
                캠핑장 등록하기
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {campgrounds.map((campground) => (
                <div
                  key={campground.id}
                  className="group relative overflow-hidden rounded-2xl bg-white p-4 shadow-sm transition-all hover:shadow-md"
                >
                  {/* 상태 배지 */}
                  <div className="absolute top-4 right-4">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                        campground.status === "ACTIVE"
                          ? "bg-green-100 text-green-700"
                          : campground.status === "INACTIVE"
                            ? "bg-gray-100 text-gray-700"
                            : campground.status === "MAINTENANCE"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                      }`}
                    >
                      {campground.status === "ACTIVE"
                        ? "운영중"
                        : campground.status === "INACTIVE"
                          ? "휴업"
                          : campground.status === "MAINTENANCE"
                            ? "정비중"
                            : "폐업"}
                    </span>
                  </div>

                  {/* 캠핑장 정보 */}
                  <div className="mb-4 pr-20">
                    <h3 className="mb-2 text-lg font-bold text-gray-900">
                      {campground.name}
                    </h3>
                    <div className="mb-2 flex items-start gap-2 text-sm text-gray-600">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                      <span className="line-clamp-1">{campground.address}</span>
                    </div>
                    {/* Category Badges */}
                    {(campground.operationType || campground.certification) && (
                      <div className="mt-2">
                        <CategoryBadges
                          operationType={campground.operationType}
                          certification={campground.certification}
                          size="sm"
                        />
                      </div>
                    )}
                  </div>

                  {/* 통계 정보 */}
                  <div className="mb-4 grid grid-cols-3 gap-3 rounded-xl bg-gray-50 p-3">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Star className="h-3.5 w-3.5 text-yellow-500" />
                        <span className="text-sm font-bold text-gray-900">
                          {campground.rating?.toFixed(1) || "0.0"}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">평점</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-gray-900">
                        {campground.reviewCount || 0}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">리뷰</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-gray-900">
                        {campground.favoriteCount || 0}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">찜</p>
                    </div>
                  </div>

                  {/* 액션 버튼 */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleViewReservations(campground.id)}
                      className="relative flex flex-col items-center gap-1 rounded-xl bg-blue-50 py-3 text-blue-600 transition-colors hover:bg-blue-100"
                    >
                      <div className="flex items-center gap-1">
                        <Calendar className="h-5 w-5" />
                        {(campgroundStats[campground.id]?.pendingReservations ||
                          0) > 0 && (
                          <span className="rounded-full bg-blue-600 px-1.5 py-0.5 text-xs font-bold text-white">
                            {
                              campgroundStats[campground.id]
                                ?.pendingReservations
                            }
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-medium">예약</span>
                    </button>
                    <button
                      onClick={() => handleManageSites(campground.id)}
                      className="relative flex flex-col items-center gap-1 rounded-xl bg-purple-50 py-3 text-purple-600 transition-colors hover:bg-purple-100"
                    >
                      <div className="flex items-center gap-1">
                        <MapPin className="h-5 w-5" />
                        {campgroundStats[campground.id]?.siteCount && (
                          <span className="rounded-full bg-purple-600 px-1.5 py-0.5 text-xs font-bold text-white">
                            {campgroundStats[campground.id]?.siteCount}
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-medium">구역</span>
                    </button>
                    <button
                      onClick={() => handleEditCampground(campground.id)}
                      className="flex flex-col items-center gap-1 rounded-xl bg-gray-50 py-3 text-gray-600 transition-colors hover:bg-gray-100"
                    >
                      <ChevronRight className="h-5 w-5" />
                      <span className="text-xs font-medium">관리</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default withOwnerAuth(OwnerDashboardPage);
