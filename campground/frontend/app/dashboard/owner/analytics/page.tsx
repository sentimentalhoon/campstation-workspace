/**
 * OWNER 매출 분석 페이지
 */

"use client";

import { OwnerDashboardNav } from "@/components/features/dashboard";
import { CampgroundViewStats } from "@/components/features/owner/CampgroundViewStats";
import { withOwnerAuth } from "@/components/hoc";
import { ownerApi } from "@/lib/api/owner";
import type { Campground } from "@/types";
import { BarChart, Calendar, DollarSign, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

function OwnerAnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [campgrounds, setCampgrounds] = useState<Campground[]>([]);
  const [stats, setStats] = useState({
    totalReservations: 0,
    totalRevenue: 0,
    totalGuests: 0,
    occupancyRate: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // 캠핑장 목록과 통계를 병렬로 가져오기
        const [campgroundsRes, statsRes] = await Promise.all([
          ownerApi.getMyCampgrounds({ page: 0, size: 20 }),
          ownerApi.getDashboardStats(),
        ]);

        setCampgrounds(campgroundsRes.content || []);
        setStats({
          totalReservations: statsRes.totalReservations || 0,
          totalRevenue: statsRes.totalRevenue || 0,
          totalGuests: statsRes.totalGuests || 0,
          occupancyRate: statsRes.occupancyRate || 0,
        });
      } catch (error) {
        console.error("데이터 로드 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="text-gray-600">데이터 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 via-white to-pink-50">
      {/* Dashboard Navigation */}
      <OwnerDashboardNav />

      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            매출 분석
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            캠핑장 매출 통계와 트렌드를 확인하세요.
          </p>
        </div>

        {/* 핵심 지표 */}
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {/* 총 예약 */}
          <div className="group relative overflow-hidden rounded-2xl bg-linear-to-br from-blue-500 to-blue-600 p-5 shadow-md transition-all hover:shadow-xl active:scale-95">
            <div className="absolute top-0 right-0 h-28 w-28 translate-x-10 -translate-y-10 rounded-full bg-white opacity-10" />
            <Calendar className="mb-2 h-10 w-10 text-white transition-transform group-hover:scale-110" />
            <p className="text-xs font-medium text-blue-100">총 예약</p>
            <p className="text-3xl font-bold text-white">
              {stats.totalReservations}
            </p>
          </div>

          {/* 총 매출 */}
          <div className="group relative overflow-hidden rounded-2xl bg-linear-to-br from-green-500 to-green-600 p-5 shadow-md transition-all hover:shadow-xl active:scale-95">
            <div className="absolute top-0 right-0 h-28 w-28 translate-x-10 -translate-y-10 rounded-full bg-white opacity-10" />
            <DollarSign className="mb-2 h-10 w-10 text-white transition-transform group-hover:scale-110" />
            <p className="text-xs font-medium text-green-100">총 매출</p>
            <p className="text-3xl font-bold text-white">
              ₩{(stats.totalRevenue / 1000000).toFixed(1)}M
            </p>
          </div>

          {/* 총 이용객 */}
          <div className="group relative overflow-hidden rounded-2xl bg-linear-to-br from-purple-500 to-purple-600 p-5 shadow-md transition-all hover:shadow-xl active:scale-95">
            <div className="absolute top-0 right-0 h-28 w-28 translate-x-10 -translate-y-10 rounded-full bg-white opacity-10" />
            <TrendingUp className="mb-2 h-10 w-10 text-white transition-transform group-hover:scale-110" />
            <p className="text-xs font-medium text-purple-100">총 이용객</p>
            <p className="text-3xl font-bold text-white">{stats.totalGuests}</p>
          </div>

          {/* 평균 점유율 */}
          <div className="group relative overflow-hidden rounded-2xl bg-linear-to-br from-orange-500 to-orange-600 p-5 shadow-md transition-all hover:shadow-xl active:scale-95">
            <div className="absolute top-0 right-0 h-28 w-28 translate-x-10 -translate-y-10 rounded-full bg-white opacity-10" />
            <BarChart className="mb-2 h-10 w-10 text-white transition-transform group-hover:scale-110" />
            <p className="text-xs font-medium text-orange-100">평균 점유율</p>
            <p className="text-3xl font-bold text-white">
              {stats.occupancyRate.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* 캠핑장별 조회수 통계 */}
        <div className="mb-6">
          <h2 className="mb-4 text-xl font-bold text-gray-900">
            캠핑장별 조회수 통계
          </h2>
          {campgrounds.length === 0 ? (
            <div className="rounded-2xl bg-white p-8 text-center shadow-md sm:p-12">
              <p className="text-gray-500">등록된 캠핑장이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {campgrounds.map((campground) => (
                <CampgroundViewStats
                  key={campground.id}
                  campgroundId={campground.id}
                  campgroundName={campground.name}
                  period={30}
                />
              ))}
            </div>
          )}
        </div>

        {/* Bottom Navigation 여백 */}
        <div className="h-20" />
      </div>
    </div>
  );
}

export default withOwnerAuth(OwnerAnalyticsPage);
