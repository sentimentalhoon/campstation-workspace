/**
 * 배너 API
 * 메인 페이지 프로모션 배너 관리 API
 */

import { API_ENDPOINTS } from "@/lib/constants";
import type { PageResponse } from "@/types";
import type {
  Banner,
  BannerSearchParams,
  BannerStats,
  CreateBannerDto,
  UpdateBannerDto,
  UpdateBannerOrderDto,
} from "@/types/domain";
import { del, get, patch, post, put } from "./client";

// ============================================================
// Public Banner API (사용자용)
// ============================================================

/**
 * 활성 배너 목록 조회
 * status === ACTIVE이고 노출 기간 내의 배너만 반환
 */
export async function getActiveBanners(params?: {
  type?: string;
  size?: number;
}): Promise<Banner[]> {
  return get<Banner[]>(API_ENDPOINTS.BANNERS.LIST, {
    params,
  });
}

/**
 * 배너 조회수 증가
 * 배너가 화면에 노출될 때 호출
 */
export async function incrementBannerView(
  id: number
): Promise<{ viewCount: number }> {
  return post<{ viewCount: number }>(API_ENDPOINTS.BANNERS.VIEW(id));
}

/**
 * 배너 클릭수 증가
 * 사용자가 배너를 클릭할 때 호출
 */
export async function incrementBannerClick(
  id: number
): Promise<{ clickCount: number }> {
  return post<{ clickCount: number }>(API_ENDPOINTS.BANNERS.CLICK(id));
}

// ============================================================
// Admin Banner API (관리자용)
// ============================================================

/**
 * 관리자 배너 API 네임스페이스
 * adminApi.banners.xxx() 형태로 사용
 */
export const bannersApi = {
  /**
   * 모든 배너 목록 조회 (페이지네이션)
   * ADMIN 권한 필요
   */
  getAll: async (
    params?: BannerSearchParams
  ): Promise<PageResponse<Banner>> => {
    return get<PageResponse<Banner>>(API_ENDPOINTS.ADMIN.BANNERS, {
      params,
    });
  },

  /**
   * 배너 상세 조회
   * ADMIN 권한 필요
   */
  getById: async (id: number): Promise<Banner> => {
    return get<Banner>(API_ENDPOINTS.ADMIN.BANNER_DETAIL(id));
  },

  /**
   * 배너 생성
   * ADMIN 권한 필요
   */
  create: async (dto: CreateBannerDto): Promise<Banner> => {
    return post<Banner>(API_ENDPOINTS.ADMIN.BANNERS, dto);
  },

  /**
   * 배너 수정
   * ADMIN 권한 필요
   */
  update: async (id: number, dto: UpdateBannerDto): Promise<Banner> => {
    return put<Banner>(API_ENDPOINTS.ADMIN.BANNER_DETAIL(id), dto);
  },

  /**
   * 배너 삭제
   * ADMIN 권한 필요
   */
  delete: async (id: number): Promise<void> => {
    return del<void>(API_ENDPOINTS.ADMIN.BANNER_DETAIL(id));
  },

  /**
   * 배너 순서 일괄 변경
   * ADMIN 권한 필요
   *
   * @example
   * updateOrder([
   *   { bannerId: 3, displayOrder: 1 },
   *   { bannerId: 1, displayOrder: 2 },
   *   { bannerId: 2, displayOrder: 3 }
   * ])
   */
  updateOrder: async (
    orders: UpdateBannerOrderDto
  ): Promise<{ updatedCount: number }> => {
    return patch<{ updatedCount: number }>(
      API_ENDPOINTS.ADMIN.BANNER_ORDER,
      { orders }
    );
  },

  /**
   * 배너 통계 조회
   * ADMIN 권한 필요
   */
  getStats: async (): Promise<BannerStats> => {
    return get<BannerStats>(API_ENDPOINTS.ADMIN.BANNER_STATS);
  },

  /**
   * 배너 상태 변경 (활성화/비활성화)
   * ADMIN 권한 필요
   */
  updateStatus: async (
    id: number,
    status: "ACTIVE" | "INACTIVE" | "SCHEDULED"
  ): Promise<Banner> => {
    return put<Banner>(API_ENDPOINTS.ADMIN.BANNER_STATUS(id), {
      status,
    });
  },
};

// Export for unified admin API
export const adminBannersApi = bannersApi;
