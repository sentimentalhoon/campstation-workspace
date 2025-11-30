/**
 * ReservationCard 컴포넌트
 * 예약 내역 카드 UI
 *
 * @see docs/sprints/sprint-2.md
 * @see docs/specifications/06-SCREEN-LAYOUTS.md - 예약 내역 (140px height)
 */

import { Badge } from "@/components/ui";
import { parseUTCToLocal } from "@/lib/utils/format";
import { formatPriceNumber } from "@/types/domain/pricing";
import type { Reservation } from "@/types/domain";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

type ReservationCardProps = {
  reservation: Reservation;
  onClick?: () => void;
};

/**
 * 예약 상태에 따른 배지 variant 반환
 */
function getStatusVariant(
  status: Reservation["status"]
): "default" | "success" | "error" | "info" {
  switch (status) {
    case "CONFIRMED":
      return "info"; // 예약 확정
    case "COMPLETED":
      return "success"; // 이용 완료
    case "CANCELLED":
      return "error"; // 취소됨
    case "PENDING":
    default:
      return "default"; // 결제 대기
  }
}

/**
 * 예약 상태 라벨
 */
function getStatusLabel(status: Reservation["status"]): string {
  switch (status) {
    case "PENDING":
      return "결제 대기";
    case "CONFIRMED":
      return "예약 확정";
    case "COMPLETED":
      return "이용 완료";
    case "CANCELLED":
      return "취소됨";
    default:
      return status;
  }
}

export function ReservationCard({
  reservation,
  onClick,
}: ReservationCardProps) {
  // UTC → 로컬 시간 변환
  const checkInDate = parseUTCToLocal(reservation.checkInDate);
  const checkOutDate = parseUTCToLocal(reservation.checkOutDate);

  // 날짜 포맷: 12/1 - 12/3
  const dateRange = `${format(checkInDate, "M/d", { locale: ko })} - ${format(checkOutDate, "M/d", { locale: ko })}`;

  // 예약 번호 생성 (실제로는 백엔드에서 제공해야 함)
  const reservationNumber = `RSV-${reservation.id.toString().padStart(6, "0")}`;

  return (
    <button
      onClick={onClick}
      className="w-full rounded-lg border border-neutral-200 bg-white p-4 text-left transition-shadow hover:shadow-md active:bg-neutral-50"
    >
      <div className="flex gap-3">
        {/* 썸네일 이미지 - 현재는 플레이스홀더 */}
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
          <div className="flex h-full items-center justify-center text-2xl">
            🏕️
          </div>
        </div>

        {/* 정보 */}
        <div className="flex-1 space-y-1">
          {/* 캠핑장 이름 */}
          <h3 className="line-clamp-1 font-bold text-neutral-900">
            {reservation.campgroundName}
          </h3>

          {/* 날짜 및 박수 */}
          <p className="text-sm text-neutral-600">
            {dateRange} ({reservation.numberOfNights}박)
          </p>

          {/* 예약 상태 */}
          <div className="flex items-center gap-2">
            <Badge variant={getStatusVariant(reservation.status)}>
              {getStatusLabel(reservation.status)}
            </Badge>
          </div>

          {/* 예약 번호 & 가격 */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-neutral-500">{reservationNumber}</p>
            <p className="text-sm font-semibold text-primary-600">
              {formatPriceNumber(reservation.totalAmount)}원
            </p>
          </div>
        </div>
      </div>
    </button>
  );
}
