/**
 * 캠핑장별 예약 관리 페이지
 */

"use client";

import {
  OwnerDashboardNav,
  OwnerCampgroundDetailNav,
} from "@/components/features/dashboard";
import { withOwnerAuth } from "@/components/hoc";
import { Select } from "@/components/ui/Select";
import { ownerApi } from "@/lib/api/owner";
import type { Reservation } from "@/types";
import { Calendar, DollarSign, Users } from "lucide-react";
import { use, useEffect, useState } from "react";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

function CampgroundReservationsPage({ params }: PageProps) {
  const { id } = use(params);
  const campgroundId = Number(id);

  const [isLoading, setIsLoading] = useState(true);
  const [campgroundName, setCampgroundName] = useState("");
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "CONFIRMED" | "CANCELLED"
  >("ALL");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // 캠핑장 정보 가져오기
        const campgroundsRes = await ownerApi.getMyCampgrounds({
          page: 0,
          size: 100,
        });
        const campground = campgroundsRes.content?.find(
          (c) => c.id === campgroundId
        );

        if (campground) {
          setCampgroundName(campground.name);
        }

        // 전체 예약 목록 가져오기 (백엔드는 캠핑장별 조회 미지원)
        const reservationsRes = await ownerApi.getReservations(undefined, {
          status: statusFilter !== "ALL" ? statusFilter : undefined,
        });

        // 해당 캠핑장의 예약만 필터링
        const filteredReservations = (reservationsRes.content || []).filter(
          (r) => r.campgroundId === campgroundId
        );
        setReservations(filteredReservations);
      } catch (error) {
        console.error("데이터 로드 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [campgroundId, statusFilter]);

  const filteredReservations = reservations.filter((reservation) => {
    if (statusFilter === "ALL") return true;
    return reservation.status === statusFilter;
  });

  const stats = {
    total: reservations.length,
    confirmed: reservations.filter((r) => r.status === "CONFIRMED").length,
    cancelled: reservations.filter((r) => r.status === "CANCELLED").length,
    totalRevenue: reservations
      .filter((r) => r.status === "CONFIRMED")
      .reduce((sum, r) => sum + r.totalAmount, 0),
  };

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
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50">
      {/* Dashboard Navigation */}
      <OwnerDashboardNav />

      {/* Campground Detail Navigation */}
      <OwnerCampgroundDetailNav campgroundId={campgroundId} />

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            예약 관리
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            {campgroundName}의 예약 현황을 확인하세요.
          </p>
        </div>

        {/* 통계 */}
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {/* 총 예약 */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-5 shadow-md transition-all hover:shadow-xl active:scale-95">
            <div className="absolute top-0 right-0 h-28 w-28 translate-x-10 -translate-y-10 rounded-full bg-white opacity-10" />
            <Calendar className="mb-2 h-8 w-8 text-white transition-transform group-hover:scale-110" />
            <p className="text-xs font-medium text-blue-100">총 예약</p>
            <p className="text-3xl font-bold text-white">{stats.total}</p>
          </div>

          {/* 확정 예약 */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500 to-green-600 p-5 shadow-md transition-all hover:shadow-xl active:scale-95">
            <div className="absolute top-0 right-0 h-28 w-28 translate-x-10 -translate-y-10 rounded-full bg-white opacity-10" />
            <Users className="mb-2 h-8 w-8 text-white transition-transform group-hover:scale-110" />
            <p className="text-xs font-medium text-green-100">확정 예약</p>
            <p className="text-3xl font-bold text-white">{stats.confirmed}</p>
          </div>

          {/* 취소 예약 */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-500 to-red-600 p-5 shadow-md transition-all hover:shadow-xl active:scale-95">
            <div className="absolute top-0 right-0 h-28 w-28 translate-x-10 -translate-y-10 rounded-full bg-white opacity-10" />
            <Calendar className="mb-2 h-8 w-8 text-white transition-transform group-hover:scale-110" />
            <p className="text-xs font-medium text-red-100">취소 예약</p>
            <p className="text-3xl font-bold text-white">{stats.cancelled}</p>
          </div>

          {/* 총 매출 */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 p-5 shadow-md transition-all hover:shadow-xl active:scale-95">
            <div className="absolute top-0 right-0 h-28 w-28 translate-x-10 -translate-y-10 rounded-full bg-white opacity-10" />
            <DollarSign className="mb-2 h-8 w-8 text-white transition-transform group-hover:scale-110" />
            <p className="text-xs font-medium text-purple-100">총 매출</p>
            <p className="text-3xl font-bold text-white">
              ₩{(stats.totalRevenue / 1000000).toFixed(1)}M
            </p>
          </div>
        </div>

        {/* 필터 */}
        <div className="mb-4 rounded-2xl bg-white p-4 shadow-md">
          <div className="flex items-center gap-3">
            <label className="text-sm font-semibold text-gray-700">상태:</label>
            <Select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value as "ALL" | "CONFIRMED" | "CANCELLED"
                )
              }
              options={[
                { value: "ALL", label: "전체" },
                { value: "CONFIRMED", label: "확정" },
                { value: "CANCELLED", label: "취소" },
              ]}
              className="flex-1 sm:flex-none"
            />
          </div>
        </div>

        {/* 예약 목록 */}
        <div className="rounded-2xl bg-white shadow-md">
          <div className="border-b border-gray-200 px-4 py-4">
            <h2 className="text-lg font-bold text-gray-900">예약 목록</h2>
            <p className="mt-1 text-xs text-gray-500">
              총 {filteredReservations.length}개
            </p>
          </div>

          {filteredReservations.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-cyan-100 to-blue-100">
                <Calendar className="h-8 w-8 text-cyan-600" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-gray-900">
                예약이 없습니다
              </h3>
              <p className="text-sm text-gray-500">
                {statusFilter === "ALL"
                  ? "아직 예약이 들어오지 않았습니다."
                  : `${statusFilter === "CONFIRMED" ? "확정된" : "취소된"} 예약이 없습니다.`}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredReservations.map((reservation) => (
                <div
                  key={reservation.id}
                  className="px-4 py-4 transition-all hover:bg-gradient-to-r hover:from-cyan-50 hover:to-transparent"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-gray-900 sm:text-lg">
                          예약 #{reservation.id}
                        </h3>
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-bold shadow-sm ${
                            reservation.status === "CONFIRMED"
                              ? "bg-gradient-to-r from-green-400 to-green-500 text-white"
                              : "bg-gradient-to-r from-red-400 to-red-500 text-white"
                          }`}
                        >
                          {reservation.status === "CONFIRMED" ? "확정" : "취소"}
                        </span>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-600 sm:text-sm">
                        <p>
                          체크인:{" "}
                          {new Date(reservation.checkInDate).toLocaleDateString(
                            "ko-KR"
                          )}
                        </p>
                        <p>
                          체크아웃:{" "}
                          {new Date(
                            reservation.checkOutDate
                          ).toLocaleDateString("ko-KR")}
                        </p>
                        <p className="font-medium">
                          인원:{" "}
                          <span className="text-gray-900">
                            {reservation.numberOfGuests}명
                          </span>
                        </p>
                      </div>
                      <p className="mt-2 text-base font-bold text-gray-900">
                        ₩{reservation.totalAmount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
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

export default withOwnerAuth(CampgroundReservationsPage);
