/**
 * useCampgroundReservations Hook
 * 캠핑장 예약 목록 조회 Hook
 */

import { ownerApi } from "@/lib/api/owner";
import type { Reservation, ReservationStatus } from "@/types";
import { useEffect, useState } from "react";

type ReservationParams = {
  status?: ReservationStatus;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
};

export function useCampgroundReservations(
  campgroundId?: number,
  params?: ReservationParams
) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchReservations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await ownerApi.getReservations(campgroundId, params);
      setReservations(response.content || []);
      setTotal(response.totalElements || 0);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("예약 목록 조회 실패"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    campgroundId,
    params?.status,
    params?.startDate,
    params?.endDate,
    params?.page,
    params?.size,
  ]);

  const updateStatus = async (
    reservationId: number,
    status: "CONFIRMED" | "CANCELLED"
  ) => {
    try {
      await ownerApi.updateReservationStatus(reservationId, status);
      // 목록 새로고침
      await fetchReservations();
    } catch (err) {
      throw err instanceof Error ? err : new Error("예약 상태 변경 실패");
    }
  };

  const refetch = () => {
    fetchReservations();
  };

  return {
    reservations,
    total,
    isLoading,
    error,
    updateStatus,
    refetch,
  };
}
