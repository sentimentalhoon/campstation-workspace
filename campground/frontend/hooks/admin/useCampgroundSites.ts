/**
 * useCampgroundSites Hook
 * 캠핑장 구역 관리 Hook
 */

import { ownerApi } from "@/lib/api/owner";
import type { SiteCreateRequest, SiteUpdateRequest } from "@/lib/api/sites";
import type { Site } from "@/types";
import { useEffect, useState } from "react";

export function useCampgroundSites(campgroundId: number) {
  const [sites, setSites] = useState<Site[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSites = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await ownerApi.getSites(campgroundId);
      setSites(response.content || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("구역 목록 조회 실패"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (campgroundId) {
      fetchSites();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campgroundId]);

  const createSite = async (data: Omit<SiteCreateRequest, "campgroundId">) => {
    try {
      await ownerApi.createSite({ ...data, campgroundId });
      await fetchSites();
    } catch (err) {
      throw err instanceof Error ? err : new Error("구역 추가 실패");
    }
  };

  const updateSite = async (siteId: number, data: SiteUpdateRequest) => {
    try {
      await ownerApi.updateSite(siteId, data);
      await fetchSites();
    } catch (err) {
      throw err instanceof Error ? err : new Error("구역 수정 실패");
    }
  };

  const deleteSite = async (siteId: number) => {
    try {
      await ownerApi.deleteSite(siteId);
      await fetchSites();
    } catch (err) {
      throw err instanceof Error ? err : new Error("구역 삭제 실패");
    }
  };

  const refetch = () => {
    fetchSites();
  };

  return {
    sites,
    isLoading,
    error,
    createSite,
    updateSite,
    deleteSite,
    refetch,
  };
}
