/**
 * SiteManager 타입 정의
 */

import { Amenity, Site, SiteType } from "@/types/domain";

/**
 * 사이트 폼 데이터
 */
export type SiteFormData = {
  siteNumber: string;
  siteType: SiteType;
  capacity: number;
  description: string;
  amenities: Amenity[];
  basePrice: number;
  latitude?: number;
  longitude?: number;
  status: "AVAILABLE" | "UNAVAILABLE" | "MAINTENANCE";
  imageFiles?: File[];
};

/**
 * SiteManager Props
 */
export type SiteManagerProps = {
  campgroundId: number;
  sites: Site[];
  onSiteAdd: (site: SiteFormData) => Promise<void>;
  onSiteUpdate: (siteId: number, site: SiteFormData) => Promise<void>;
  onSiteDelete: (siteId: number) => Promise<void>;
  isLoading?: boolean;
};

/**
 * 사이트 폼 에러
 */
export type SiteFormErrors = Partial<Record<keyof SiteFormData, string>>;
