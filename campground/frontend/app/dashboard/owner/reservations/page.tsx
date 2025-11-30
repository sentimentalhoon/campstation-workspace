/**
 * OWNER 전체 예약 관리 페이지
 */

"use client";

import { OwnerDashboardNav } from "@/components/features/dashboard";
import { withOwnerAuth } from "@/components/hoc";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { ApiError, NetworkError } from "@/lib/api/errors";
import { ownerApi } from "@/lib/api/owner";
import { ROUTES } from "@/lib/constants";
import type { Reservation } from "@/types";
import { Calendar, DollarSign, ExternalLink, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function OwnerReservationsPage() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED"
  >("ALL");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // 전체 예약 목록 가져오기
        const reservationsRes = await ownerApi.getReservations(undefined, {
          status: statusFilter !== "ALL" ? statusFilter : undefined,
        });
        setReservations(reservationsRes.content || []);
      } catch (error) {
        if (error instanceof ApiError) {
          if (error.status === 404) {
            console.error("예약 데이터를 찾을 수 없습니다.");
          } else if (error.status === 403) {
            console.error("예약 조회 권한이 없습니다.");
          } else if (error.status >= 500) {
            console.error("서버 오류가 발생했습니다.");
          } else {
            console.error("데이터 로드 실패:", error.message);
          }
        } else if (error instanceof NetworkError) {
          console.error("네트워크 연결을 확인해주세요.");
        } else {
          console.error("데이터 로드 실패:", error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [statusFilter]);

  const filteredReservations = reservations.filter((reservation) => {
    if (statusFilter === "ALL") return true;
    return reservation.status === statusFilter;
  });

  const stats = {
    total: reservations.length,
    pending: reservations.filter((r) => r.status === "PENDING").length,
    confirmed: reservations.filter((r) => r.status === "CONFIRMED").length,
    completed: reservations.filter((r) => r.status === "COMPLETED").length,
    cancelled: reservations.filter((r) => r.status === "CANCELLED").length,
    totalRevenue: reservations
      .filter((r) => r.status === "CONFIRMED" || r.status === "COMPLETED")
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
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-indigo-50">
      {/* Dashboard Navigation */}
      <OwnerDashboardNav />

      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            전체 예약 관리
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            모든 캠핑장의 예약 현황을 확인하세요.
          </p>
        </div>

        {/* 통계 카드 */}
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
          {/* 총 예약 */}
          <div className="group relative overflow-hidden rounded-2xl bg-linear-to-br from-blue-500 to-blue-600 p-4 shadow-md transition-all hover:shadow-xl active:scale-95">
            <div className="absolute top-0 right-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-white opacity-10" />
            <Calendar className="mb-2 h-7 w-7 text-white transition-transform group-hover:scale-110" />
            <p className="text-xs font-medium text-blue-100">총 예약</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>

          {/* 대기중 */}
          <div className="group relative overflow-hidden rounded-2xl bg-linear-to-br from-yellow-500 to-yellow-600 p-4 shadow-md transition-all hover:shadow-xl active:scale-95">
            <div className="absolute top-0 right-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-white opacity-10" />
            <Calendar className="mb-2 h-7 w-7 text-white transition-transform group-hover:scale-110" />
            <p className="text-xs font-medium text-yellow-100">대기중</p>
            <p className="text-2xl font-bold text-white">{stats.pending}</p>
          </div>

          {/* 확정 예약 */}
          <div className="group relative overflow-hidden rounded-2xl bg-linear-to-br from-green-500 to-green-600 p-4 shadow-md transition-all hover:shadow-xl active:scale-95">
            <div className="absolute top-0 right-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-white opacity-10" />
            <Users className="mb-2 h-7 w-7 text-white transition-transform group-hover:scale-110" />
            <p className="text-xs font-medium text-green-100">확정 예약</p>
            <p className="text-2xl font-bold text-white">{stats.confirmed}</p>
          </div>

          {/* 완료된 예약 */}
          <div className="group relative overflow-hidden rounded-2xl bg-linear-to-br from-indigo-500 to-indigo-600 p-4 shadow-md transition-all hover:shadow-xl active:scale-95">
            <div className="absolute top-0 right-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-white opacity-10" />
            <Calendar className="mb-2 h-7 w-7 text-white transition-transform group-hover:scale-110" />
            <p className="text-xs font-medium text-indigo-100">완료</p>
            <p className="text-2xl font-bold text-white">{stats.completed}</p>
          </div>

          {/* 취소 예약 */}
          <div className="group relative overflow-hidden rounded-2xl bg-linear-to-br from-red-500 to-red-600 p-4 shadow-md transition-all hover:shadow-xl active:scale-95">
            <div className="absolute top-0 right-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-white opacity-10" />
            <Calendar className="mb-2 h-7 w-7 text-white transition-transform group-hover:scale-110" />
            <p className="text-xs font-medium text-red-100">취소</p>
            <p className="text-2xl font-bold text-white">{stats.cancelled}</p>
          </div>
        </div>

        {/* 매출 통계 */}
        <div className="mb-6">
          <div className="group relative overflow-hidden rounded-2xl bg-linear-to-br from-purple-500 to-purple-600 p-5 shadow-md transition-all hover:shadow-xl active:scale-95">
            <div className="absolute top-0 right-0 h-32 w-32 translate-x-12 -translate-y-12 rounded-full bg-white opacity-10" />
            <div className="flex items-center">
              <DollarSign className="h-10 w-10 text-white transition-transform group-hover:scale-110" />
              <div className="ml-4">
                <p className="text-sm font-medium text-purple-100">
                  총 매출 (확정 + 완료)
                </p>
                <p className="text-3xl font-bold text-white">
                  ₩{stats.totalRevenue.toLocaleString()}
                </p>
              </div>
            </div>
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
                  e.target.value as
                    | "ALL"
                    | "PENDING"
                    | "CONFIRMED"
                    | "CANCELLED"
                    | "COMPLETED"
                )
              }
              options={[
                { value: "ALL", label: "전체" },
                { value: "PENDING", label: "대기중" },
                { value: "CONFIRMED", label: "확정" },
                { value: "COMPLETED", label: "완료" },
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
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-blue-100 to-indigo-100">
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-gray-900">
                예약이 없습니다
              </h3>
              <p className="text-sm text-gray-500">
                {statusFilter === "ALL"
                  ? "아직 예약이 들어오지 않았습니다."
                  : statusFilter === "PENDING"
                    ? "대기중인 예약이 없습니다."
                    : statusFilter === "CONFIRMED"
                      ? "확정된 예약이 없습니다."
                      : statusFilter === "COMPLETED"
                        ? "완료된 예약이 없습니다."
                        : "취소된 예약이 없습니다."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredReservations.map((reservation) => (
                <div
                  key={reservation.id}
                  className="cursor-pointer px-4 py-4 transition-all hover:bg-linear-to-r hover:from-blue-50 hover:to-transparent active:scale-[0.99]"
                  onClick={() =>
                    router.push(ROUTES.RESERVATIONS.DETAIL(reservation.id))
                  }
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-gray-900 sm:text-lg">
                          {reservation.campgroundName}
                        </h3>
                        {/* 예약 상태 배지 */}
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-bold shadow-sm ${
                            reservation.status === "PENDING"
                              ? "bg-linear-to-r from-yellow-400 to-yellow-500 text-white"
                              : reservation.status === "CONFIRMED"
                                ? "bg-linear-to-r from-green-400 to-green-500 text-white"
                                : reservation.status === "COMPLETED"
                                  ? "bg-linear-to-r from-blue-400 to-blue-500 text-white"
                                  : "bg-linear-to-r from-red-400 to-red-500 text-white"
                          }`}
                        >
                          {reservation.status === "PENDING"
                            ? "대기중"
                            : reservation.status === "CONFIRMED"
                              ? "확정"
                              : reservation.status === "COMPLETED"
                                ? "완료"
                                : "취소"}
                        </span>
                        {/* 결제 상태 배지 */}
                        {reservation.payment && (
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-bold shadow-sm ${
                              reservation.payment.status === "COMPLETED"
                                ? "bg-linear-to-r from-emerald-400 to-emerald-500 text-white"
                                : reservation.payment.status === "PENDING"
                                  ? "bg-linear-to-r from-orange-400 to-orange-500 text-white"
                                  : reservation.payment.status ===
                                      "CONFIRMATION_REQUESTED"
                                    ? "bg-linear-to-r from-sky-400 to-sky-500 text-white"
                                    : reservation.payment.status === "FAILED"
                                      ? "bg-linear-to-r from-rose-400 to-rose-500 text-white"
                                      : reservation.payment.status ===
                                          "REFUNDED"
                                        ? "bg-linear-to-r from-purple-400 to-purple-500 text-white"
                                        : "bg-gray-200 text-gray-700"
                            }`}
                          >
                            {reservation.payment.status === "COMPLETED"
                              ? "결제완료"
                              : reservation.payment.status === "PENDING"
                                ? "결제대기"
                                : reservation.payment.status ===
                                    "CONFIRMATION_REQUESTED"
                                  ? "입금확인요청"
                                  : reservation.payment.status === "FAILED"
                                    ? "결제실패"
                                    : reservation.payment.status === "REFUNDED"
                                      ? "환불완료"
                                      : "알수없음"}
                          </span>
                        )}
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-600 sm:text-sm">
                        <p className="font-medium">
                          예약자:{" "}
                          <span className="text-gray-900">
                            {reservation.userName}
                          </span>
                        </p>
                        <p className="font-medium">
                          인원:{" "}
                          <span className="text-gray-900">
                            {reservation.numberOfGuests}명
                          </span>
                        </p>
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
                        {/* 결제 정보 */}
                        {reservation.payment && (
                          <>
                            <p>
                              결제방법:{" "}
                              {reservation.payment.paymentMethod === "CARD"
                                ? "카드"
                                : reservation.payment.paymentMethod ===
                                    "BANK_TRANSFER"
                                  ? "계좌이체"
                                  : "간편결제"}
                            </p>
                            {reservation.payment.depositorName && (
                              <p>
                                입금자명: {reservation.payment.depositorName}
                              </p>
                            )}
                          </>
                        )}
                      </div>
                      <p className="mt-2 text-base font-bold text-gray-900">
                        ₩{reservation.totalAmount.toLocaleString()}
                      </p>
                    </div>
                    {/* 상세보기 버튼 */}
                    <div className="shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(
                            `/dashboard/owner/reservations/${reservation.id}`
                          );
                        }}
                        className="rounded-xl shadow-sm transition-all hover:shadow-md active:scale-95"
                      >
                        <ExternalLink className="h-4 w-4 sm:mr-1" />
                        <span className="hidden sm:inline">상세보기</span>
                      </Button>
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

export default withOwnerAuth(OwnerReservationsPage);
