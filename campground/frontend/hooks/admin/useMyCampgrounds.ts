/**
 * useMyCampgrounds Hook
 * OWNER가 자신의 캠핑장 목록을 조회하는 Hook
 */

import { ownerApi } from "@/lib/api/owner";
import type { Campground } from "@/types";
import { useEffect, useState } from "react";

export function useMyCampgrounds() {
  const [campgrounds, setCampgrounds] = useState<Campground[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCampgrounds = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await ownerApi.getMyCampgrounds();
      setCampgrounds(response.content || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("캠핑장 목록 조회 실패"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCampgrounds();
  }, []);

  const refetch = () => {
    fetchCampgrounds();
  };

  return {
    campgrounds,
    isLoading,
    error,
    refetch,
  };
}
