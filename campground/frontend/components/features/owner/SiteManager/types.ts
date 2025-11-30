/**
 * Owner SiteManager 타입 정의
 */

import { Amenity, SiteType } from "@/types/domain";

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
  deletedImageIds?: number[]; // 삭제할 이미지 ID 목록
};

/**
 * SiteManager Props
 */
export type SiteManagerProps = {
  campgroundId: number;
};

/**
 * 사이트 폼 에러
 */
export type SiteFormErrors = Partial<Record<keyof SiteFormData, string>>;
