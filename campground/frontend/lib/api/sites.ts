/**
 * Site (캠핑장 구역) API
 * Owner와 Admin이 공통으로 사용하는 Site 관리 API
 */

import { API_ENDPOINTS } from "@/lib/constants";
import type { PageResponse, Site } from "@/types";
import { del, get, post, put } from "./client";

/**
 * Site 생성 요청 타입
 */
export type SiteCreateRequest = {
  campgroundId: number;
  siteNumber: string;
  siteType: string;
  capacity: number;
  description: string;
  amenities: string[];
  basePrice: number;
  latitude?: number;
  longitude?: number;
  imageFiles?: File[];
};

/**
 * Site 수정 요청 타입
 */
export type SiteUpdateRequest = {
  siteNumber?: string;
  siteType?: string;
  capacity?: number;
  description?: string;
  amenities?: string[];
  basePrice?: number;
  latitude?: number;
  longitude?: number;
  status?: string;
  imageFiles?: File[];
};

/**
 * Site API
 */
export const siteApi = {
  /**
   * 캠핑장의 Site 목록 조회 (페이지네이션)
   */
  getByCampground: (
    campgroundId: number,
    params?: { page?: number; size?: number }
  ) =>
    get<PageResponse<Site>>(API_ENDPOINTS.SITES.BY_CAMPGROUND(campgroundId), {
      params,
    }),

  /**
   * Site 상세 조회
   */
  getById: (siteId: number) => get<Site>(API_ENDPOINTS.SITES.DETAIL(siteId)),

  /**
   * Site 생성 (Owner/Admin 전용)
   * @param data - Site 생성 데이터 또는 FormData (이미지 포함 시)
   */
  create: (data: SiteCreateRequest | FormData) => {
    if (data instanceof FormData) {
      return post<Site>(API_ENDPOINTS.SITES.CREATE, data);
    }
    return post<Site>(API_ENDPOINTS.SITES.CREATE, data);
  },

  /**
   * Site 수정 (Owner/Admin 전용)
   * @param siteId - Site ID
   * @param data - Site 수정 데이터 또는 FormData (이미지 포함 시)
   */
  update: (siteId: number, data: SiteUpdateRequest | FormData) => {
    if (data instanceof FormData) {
      return put<Site>(API_ENDPOINTS.SITES.UPDATE(siteId), data);
    }
    return put<Site>(API_ENDPOINTS.SITES.UPDATE(siteId), data);
  },

  /**
   * Site 삭제 (Owner/Admin 전용)
   */
  delete: (siteId: number) => del<void>(API_ENDPOINTS.SITES.DELETE(siteId)),
};
