"use client";

import { ExcelDownloadButton } from "@/components/common/ExcelDownloadButton";
import { AdminDashboardNav } from "@/components/features/dashboard";
import { withAdminAuth } from "@/components/hoc";
import { EmptyState } from "@/components/ui";
import { Select } from "@/components/ui/Select";
import { useAllReservations } from "@/hooks";
import { useToast } from "@/hooks/ui/useToast";
import { Calendar, Filter, XCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

/**
 * 예약 관리 페이지
 * 전체 예약 목록 조회 및 취소 처리
 */
function AdminReservationsPage() {
  const toast = useToast();
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED"
  >("ALL");

  const { reservations, isLoading, error, cancelReservation } =
    useAllReservations({
      status: statusFilter !== "ALL" ? statusFilter : undefined,
    });

  /**
   * 예약 취소 처리
   */
  const handleCancel = async (id: number) => {
    const reason = prompt("취소 사유를 입력하세요:");
    if (!reason) return;

    if (!confirm("예약을 취소하시겠습니까?\n환불 처리가 진행됩니다.")) {
      return;
    }

    try {
      await cancelReservation(id, reason);
      toast.success("취소되었습니다");
    } catch (error) {
      toast.error("취소 처리에 실패했습니다");
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="text-gray-600">예약 목록 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center text-red-600">
          <p>예약 목록을 불러오는데 실패했습니다.</p>
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

  const reservationList = reservations?.content || [];
  const totalReservations = reservations?.totalElements || 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-14">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b bg-white">
        <div className="px-4 py-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">예약 관리</h1>
              <p className="mt-1 text-sm text-gray-600">
                전체 {totalReservations.toLocaleString()}건
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ExcelDownloadButton
                data={reservationList}
                filename="예약목록"
                sheetName="예약"
                disabled={reservationList.length === 0}
              />
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
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

          <div>
            <Select
              label="예약 상태"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value as
                    | "ALL"
                    | "PENDING"
                    | "CONFIRMED"
                    | "COMPLETED"
                    | "CANCELLED"
                )
              }
              options={[
                { value: "ALL", label: "전체" },
                { value: "PENDING", label: "대기" },
                { value: "CONFIRMED", label: "확정" },
                { value: "COMPLETED", label: "완료" },
                { value: "CANCELLED", label: "취소" },
              ]}
            />
          </div>
        </div>

        {/* 통계 */}
        <div className="grid grid-cols-4 gap-2">
          <div className="rounded-lg border bg-white p-3">
            <p className="text-xs text-gray-600">대기</p>
            <p className="mt-1 text-xl font-bold text-orange-600">
              {reservationList.filter((r) => r.status === "PENDING").length}
            </p>
          </div>
          <div className="rounded-lg border bg-white p-3">
            <p className="text-xs text-gray-600">확정</p>
            <p className="mt-1 text-xl font-bold text-blue-600">
              {reservationList.filter((r) => r.status === "CONFIRMED").length}
            </p>
          </div>
          <div className="rounded-lg border bg-white p-3">
            <p className="text-xs text-gray-600">완료</p>
            <p className="mt-1 text-xl font-bold text-green-600">
              {reservationList.filter((r) => r.status === "COMPLETED").length}
            </p>
          </div>
          <div className="rounded-lg border bg-white p-3">
            <p className="text-xs text-gray-600">취소</p>
            <p className="mt-1 text-xl font-bold text-red-600">
              {reservationList.filter((r) => r.status === "CANCELLED").length}
            </p>
          </div>
        </div>

        {/* 예약 목록 */}
        <div className="space-y-3">
          {reservationList.length === 0 ? (
            <EmptyState
              icon={<Calendar className="h-full w-full" />}
              title="예약이 없습니다"
              variant="bordered"
            />
          ) : (
            reservationList.map((reservation) => (
              <div
                key={reservation.id}
                className="overflow-hidden rounded-lg border bg-white"
              >
                <Link
                  href={`/reservations/${reservation.id}`}
                  className="block p-4"
                >
                  <div className="mb-2 flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {reservation.campgroundName}
                      </h3>
                      <p className="mt-1 text-sm text-gray-600">
                        예약자: {reservation.userName}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusStyle(
                        reservation.status
                      )}`}
                    >
                      {getStatusLabel(reservation.status)}
                    </span>
                  </div>

                  <div className="space-y-1 text-sm text-gray-600">
                    <p>
                      체크인:{" "}
                      {new Date(reservation.checkInDate).toLocaleDateString(
                        "ko-KR"
                      )}
                    </p>
                    <p>
                      체크아웃:{" "}
                      {new Date(reservation.checkOutDate).toLocaleDateString(
                        "ko-KR"
                      )}
                    </p>
                    <p className="font-semibold text-gray-900">
                      {reservation.totalAmount.toLocaleString()}원
                    </p>
                  </div>
                </Link>

                {/* 관리 버튼 */}
                {(reservation.status === "PENDING" ||
                  reservation.status === "CONFIRMED") && (
                  <div className="border-t bg-gray-50 p-3">
                    <button
                      onClick={() => handleCancel(reservation.id)}
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
                    >
                      <XCircle className="h-4 w-4" />
                      예약 취소 (환불)
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* 페이지네이션 안내 */}
        {reservations && reservations.totalPages > 1 && (
          <div className="text-center text-sm text-gray-500">
            페이지 1 / {reservations.totalPages}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * 상태 스타일
 */
function getStatusStyle(status: string): string {
  switch (status) {
    case "PENDING":
      return "bg-orange-100 text-orange-800";
    case "CONFIRMED":
      return "bg-blue-100 text-blue-800";
    case "COMPLETED":
      return "bg-green-100 text-green-800";
    case "CANCELLED":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

/**
 * 상태 레이블
 */
function getStatusLabel(status: string): string {
  switch (status) {
    case "PENDING":
      return "대기";
    case "CONFIRMED":
      return "확정";
    case "COMPLETED":
      return "완료";
    case "CANCELLED":
      return "취소";
    default:
      return status;
  }
}

export default withAdminAuth(AdminReservationsPage);
