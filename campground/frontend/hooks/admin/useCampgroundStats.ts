/**
 * useCampgroundStats Hook
 * 캠핑장 통계 조회 Hook
 */

import { ownerApi } from "@/lib/api/owner";
import { useEffect, useState } from "react";

type CampgroundStats = {
  totalReservations: number;
  reservationChange: number;
  totalRevenue: number;
  revenueChange: number;
  totalGuests: number;
  guestsChange: number;
  occupancyRate: number;
  occupancyChange: number;
};

export function useCampgroundStats(
  campgroundId?: number,
  params?: {
    startDate?: string;
    endDate?: string;
  }
) {
  const [stats, setStats] = useState<CampgroundStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await ownerApi.getStats(campgroundId, params);
      setStats(response.data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("통계 조회 실패"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campgroundId, params?.startDate, params?.endDate]);

  const refetch = () => {
    fetchStats();
  };

  return {
    stats,
    isLoading,
    error,
    refetch,
  };
}
