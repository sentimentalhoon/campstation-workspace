/**
 * ReservationTable 타입 정의
 */

import { Reservation, ReservationStatus } from "@/types/domain";

/**
 * ReservationTable Props
 */
export type ReservationTableProps = {
  reservations: Reservation[];
  onStatusChange: (
    reservationId: number,
    status: ReservationStatus
  ) => Promise<void>;
  onViewDetail: (reservation: Reservation) => void;
  isLoading?: boolean;
};

/**
 * 정렬 필드
 */
export type SortField = "checkInDate" | "totalAmount" | "status" | "createdAt";

/**
 * 정렬 방향
 */
export type SortOrder = "asc" | "desc";
