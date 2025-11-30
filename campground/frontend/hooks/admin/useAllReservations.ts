/**
 * useAllReservations Hook
 * 전체 예약 목록 조회 (ADMIN용)
 */

import { adminApi } from "@/lib/api/admin";
import type { PageResponse, Reservation } from "@/types";
import { useCallback, useEffect, useState } from "react";

type UseAllReservationsParams = {
  page?: number;
  size?: number;
  status?: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  startDate?: string;
  endDate?: string;
};

export const useAllReservations = (params?: UseAllReservationsParams) => {
  const [reservations, setReservations] =
    useState<PageResponse<Reservation> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchReservations = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await adminApi.getAllReservations(params);
      setReservations(data);
    } catch (err) {
      setError(err as Error);
      console.error("Failed to fetch reservations:", err);
    } finally {
      setIsLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  /**
   * 예약 취소 (환불 처리)
   */
  const cancelReservation = useCallback(
    async (reservationId: number, reason?: string) => {
      try {
        await adminApi.cancelReservation(reservationId, reason);
        await fetchReservations(); // 목록 새로고침
      } catch (err) {
        console.error("Failed to cancel reservation:", err);
        throw err;
      }
    },
    [fetchReservations]
  );

  return {
    reservations,
    isLoading,
    error,
    refetch: fetchReservations,
    cancelReservation,
  };
};
