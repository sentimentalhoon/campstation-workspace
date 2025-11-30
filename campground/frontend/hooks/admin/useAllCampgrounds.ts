/**
 * useAllCampgrounds Hook
 * 전체 캠핑장 목록 조회 및 관리 (ADMIN용)
 */

import { adminApi, type ApprovalStatus } from "@/lib/api/admin";
import type { Campground, PageResponse } from "@/types";
import { useCallback, useEffect, useState } from "react";

type UseAllCampgroundsParams = {
  page?: number;
  size?: number;
  status?: ApprovalStatus;
  search?: string;
};

export const useAllCampgrounds = (params?: UseAllCampgroundsParams) => {
  const [campgrounds, setCampgrounds] =
    useState<PageResponse<Campground> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCampgrounds = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await adminApi.getAllCampgrounds(params);
      setCampgrounds(data);
    } catch (err) {
      setError(err as Error);
      console.error("Failed to fetch campgrounds:", err);
    } finally {
      setIsLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchCampgrounds();
  }, [fetchCampgrounds]);

  /**
   * 캠핑장 승인
   */
  const approveCampground = useCallback(
    async (campgroundId: number) => {
      try {
        await adminApi.approveCampground(campgroundId);
        await fetchCampgrounds(); // 목록 새로고침
      } catch (err) {
        console.error("Failed to approve campground:", err);
        throw err;
      }
    },
    [fetchCampgrounds]
  );

  /**
   * 캠핑장 거부
   */
  const rejectCampground = useCallback(
    async (campgroundId: number, reason: string) => {
      try {
        await adminApi.rejectCampground(campgroundId, reason);
        await fetchCampgrounds(); // 목록 새로고침
      } catch (err) {
        console.error("Failed to reject campground:", err);
        throw err;
      }
    },
    [fetchCampgrounds]
  );

  /**
   * 캠핑장 삭제
   */
  const deleteCampground = useCallback(
    async (campgroundId: number) => {
      try {
        await adminApi.deleteCampground(campgroundId);
        await fetchCampgrounds(); // 목록 새로고침
      } catch (err) {
        console.error("Failed to delete campground:", err);
        throw err;
      }
    },
    [fetchCampgrounds]
  );

  return {
    campgrounds,
    isLoading,
    error,
    refetch: fetchCampgrounds,
    approveCampground,
    rejectCampground,
    deleteCampground,
  };
};
