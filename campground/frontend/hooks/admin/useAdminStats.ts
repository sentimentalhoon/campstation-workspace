/**
 * useAdminStats Hook
 * 전체 시스템 통계 및 최근 활동 조회
 */

import {
  adminApi,
  type AdminStats,
  type RecentActivity,
} from "@/lib/api/admin";
import { useCallback, useEffect, useState } from "react";

export const useAdminStats = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [statsData, activitiesData] = await Promise.all([
        adminApi.getStats(),
        adminApi.getRecentActivities({ limit: 10 }),
      ]);

      setStats(statsData);
      setActivities(activitiesData);
    } catch (err) {
      setError(err as Error);
      console.error("Failed to fetch admin stats:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    activities,
    isLoading,
    error,
    refetch: fetchStats,
  };
};
