/**
 * ReservationTable 컴포넌트
 * 예약 목록 테이블
 * - 정렬 기능
 * - 상태 필터
 * - 상태 변경
 * - 상세 보기
 */

"use client";

import { ReservationStatus } from "@/types/domain";
import {
  ArrowUpDown,
  Calendar,
  DollarSign,
  Eye,
  Filter,
  MapPin,
  User,
} from "lucide-react";
import { useState } from "react";
import { ReservationTableProps, SortField, SortOrder } from "./types";

// 상태 색상 매핑
const statusColors: Record<ReservationStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  COMPLETED: "bg-gray-100 text-gray-800",
};

export function ReservationTable({
  reservations,
  onStatusChange,
  onViewDetail,
  isLoading = false,
}: ReservationTableProps) {
  const [sortField, setSortField] = useState<SortField>("checkInDate");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | "ALL">(
    "ALL"
  );

  // 정렬 핸들러
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  // 필터링 및 정렬된 예약 목록
  // React Compiler가 자동으로 메모이제이션 처리
  let filtered = reservations;

  // 상태 필터
  if (statusFilter !== "ALL") {
    filtered = filtered.filter((r) => r.status === statusFilter);
  }

  // 정렬
  const filteredAndSortedReservations = [...filtered].sort((a, b) => {
    let aValue: string | number;
    let bValue: string | number;

    switch (sortField) {
      case "checkInDate":
        aValue = new Date(a.checkInDate).getTime();
        bValue = new Date(b.checkInDate).getTime();
        break;
      case "totalAmount":
        aValue = a.totalAmount;
        bValue = b.totalAmount;
        break;
      case "status":
        aValue = a.status;
        bValue = b.status;
        break;
      case "createdAt":
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
        break;
      default:
        return 0;
    }

    if (sortOrder === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // 날짜 포맷 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  return (
    <div className="space-y-4">
      {/* 헤더 & 필터 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">예약 목록</h2>
          <p className="mt-1 text-sm text-gray-500">
            총 {filteredAndSortedReservations.length}개 예약
          </p>
        </div>

        {/* 상태 필터 */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as ReservationStatus | "ALL")
            }
            className="focus:ring-primary-500 focus:border-primary-500 rounded-lg border border-gray-300 px-4 py-2 focus:ring-2"
          >
            <option value="ALL">전체</option>
            <option value="PENDING">대기 중</option>
            <option value="CONFIRMED">확정</option>
            <option value="CANCELLED">취소</option>
            <option value="COMPLETED">완료</option>
          </select>
        </div>
      </div>

      {/* 테이블 */}
      {filteredAndSortedReservations.length === 0 ? (
        <div className="rounded-lg bg-white p-12 text-center shadow-sm">
          <Calendar className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h3 className="mb-2 text-lg font-medium text-gray-900">
            예약이 없습니다
          </h3>
          <p className="text-gray-500">
            {statusFilter !== "ALL"
              ? "해당 상태의 예약이 없습니다."
              : "아직 예약이 없습니다."}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    예약번호
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    <button
                      onClick={() => handleSort("checkInDate")}
                      className="flex items-center gap-1 hover:text-gray-700"
                    >
                      체크인
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    이용자
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    구역
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    <button
                      onClick={() => handleSort("totalAmount")}
                      className="flex items-center gap-1 hover:text-gray-700"
                    >
                      금액
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    <button
                      onClick={() => handleSort("status")}
                      className="flex items-center gap-1 hover:text-gray-700"
                    >
                      상태
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredAndSortedReservations.map((reservation) => (
                  <tr
                    key={reservation.id}
                    className="transition-colors hover:bg-gray-50"
                  >
                    {/* 예약번호 */}
                    <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">
                      #{reservation.id}
                    </td>

                    {/* 체크인/체크아웃 */}
                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <div>
                          <div>{formatDate(reservation.checkInDate)}</div>
                          <div className="text-xs text-gray-400">
                            ~ {formatDate(reservation.checkOutDate)}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* 이용자 */}
                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <div>
                          <div>{reservation.userName}</div>
                          <div className="text-xs text-gray-400">
                            {reservation.numberOfGuests}명
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* 구역 */}
                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <div>
                          <div className="font-medium text-gray-900">
                            {reservation.siteNumber}
                          </div>
                          <div className="text-xs text-gray-400">
                            {reservation.campgroundName}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* 금액 */}
                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        <div>
                          <div className="font-medium text-gray-900">
                            {reservation.totalAmount.toLocaleString()}원
                          </div>
                          <div className="text-xs text-gray-400">
                            {reservation.numberOfNights}박
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* 상태 */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={reservation.status}
                        onChange={(e) =>
                          onStatusChange(
                            reservation.id,
                            e.target.value as ReservationStatus
                          )
                        }
                        disabled={isLoading}
                        className={`cursor-pointer rounded-full border-0 px-3 py-1 text-xs font-medium ${
                          statusColors[reservation.status]
                        }`}
                      >
                        <option value="PENDING">대기 중</option>
                        <option value="CONFIRMED">확정</option>
                        <option value="CANCELLED">취소</option>
                        <option value="COMPLETED">완료</option>
                      </select>
                    </td>

                    {/* 작업 */}
                    <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                      <button
                        onClick={() => onViewDetail(reservation)}
                        className="text-primary-600 hover:text-primary-900 inline-flex items-center gap-1"
                      >
                        <Eye className="h-4 w-4" />
                        상세
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 통계 요약 */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <p className="mb-1 text-sm text-gray-500">전체 예약</p>
          <p className="text-2xl font-bold text-gray-900">
            {reservations.length}
          </p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <p className="mb-1 text-sm text-gray-500">확정 예약</p>
          <p className="text-2xl font-bold text-green-600">
            {reservations.filter((r) => r.status === "CONFIRMED").length}
          </p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <p className="mb-1 text-sm text-gray-500">대기 중</p>
          <p className="text-2xl font-bold text-yellow-600">
            {reservations.filter((r) => r.status === "PENDING").length}
          </p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <p className="mb-1 text-sm text-gray-500">총 매출</p>
          <p className="text-primary-600 text-2xl font-bold">
            {reservations
              .filter((r) => r.status !== "CANCELLED")
              .reduce((sum, r) => sum + r.totalAmount, 0)
              .toLocaleString()}
            원
          </p>
        </div>
      </div>
    </div>
  );
}
