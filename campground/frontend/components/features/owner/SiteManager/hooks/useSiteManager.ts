/**
 * useSiteManager Hook
 * Owner-specific site management with API integration
 */

import { ownerApi } from "@/lib/api/owner";
import { siteApi } from "@/lib/api/sites";
import { logError } from "@/lib/errors/logger";
import { convertSiteToFormData } from "@/lib/utils/siteFormData";
import type { Site } from "@/types/domain";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { SiteFormData } from "../types";

export function useSiteManager(campgroundId: number) {
  const searchParams = useSearchParams();
  const [sites, setSites] = useState<Site[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);

  // Load sites
  const loadSites = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await ownerApi.getSites(campgroundId, {
        page: 0,
        size: 100,
      });
      setSites(response.content || []);
    } catch (error) {
      logError(error, {
        location: "useSiteManager.loadSites",
        campgroundId,
      });
    } finally {
      setIsLoading(false);
    }
  }, [campgroundId]);

  // Initial load
  useEffect(() => {
    loadSites();
  }, [loadSites]);

  // Auto-open form from URL parameter
  useEffect(() => {
    const siteId = searchParams.get("siteId");
    if (siteId && sites.length > 0) {
      const targetSite = sites.find((s) => s.id === Number(siteId));
      if (targetSite) {
        setSelectedSite(targetSite);
      }
    }
  }, [searchParams, sites]);

  // Add site
  const addSite = useCallback(
    async (data: SiteFormData) => {
      try {
        const formData = convertSiteToFormData(data, campgroundId);
        await siteApi.create(formData);
        await loadSites();
      } catch (error) {
        logError(error, {
          location: "useSiteManager.addSite",
          campgroundId,
        });
        throw error;
      }
    },
    [campgroundId, loadSites]
  );

  // Update site
  const updateSite = useCallback(
    async (siteId: number, data: SiteFormData) => {
      try {
        const formData = convertSiteToFormData(
          data,
          undefined, // campgroundId는 수정 시 불필요
          data.deletedImageIds
        );
        await siteApi.update(siteId, formData);
        await loadSites();
      } catch (error) {
        logError(error, {
          location: "useSiteManager.updateSite",
          siteId,
        });
        throw error;
      }
    },
    [loadSites]
  );

  // Delete site
  const deleteSite = useCallback(
    async (siteId: number) => {
      try {
        await siteApi.delete(siteId);
        await loadSites();
      } catch (error) {
        logError(error, {
          location: "useSiteManager.deleteSite",
          siteId,
        });
        throw error;
      }
    },
    [loadSites]
  );

  return {
    sites,
    isLoading,
    selectedSite,
    setSelectedSite,
    addSite,
    updateSite,
    deleteSite,
    refreshSites: loadSites,
  };
}
