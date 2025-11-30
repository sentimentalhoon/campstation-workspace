/**
 * OWNER 전용 API
 * 캠핑장 소유자가 자신의 캠핑장을 관리하는 API
 */

import { API_ENDPOINTS } from "@/lib/constants";
import type {
  Campground,
  CampgroundDetailResponse,
  PageResponse,
  Reservation,
  Review,
} from "@/types";
import { del, get, post, put } from "./client";
import {
  siteApi,
  type SiteCreateRequest,
  type SiteUpdateRequest,
} from "./sites";

/**
 * Owner 대시보드 통계 타입
 */
export type OwnerDashboardStats = {
  totalReservations: number;
  totalRevenue: number;
  totalGuests: number;
  occupancyRate: number;
  monthlyRevenue: number;
  monthlyReservations: number;
  averageRating: number;
  totalReviews: number;
};

/**
 * OWNER 캠핑장 관리 API
 */
export const ownerApi = {
  // ========== 캠핑장 관리 ==========

  /**
   * 내 캠핑장 목록 조회 (페이지네이션)
   */
  getMyCampgrounds: (params?: { page?: number; size?: number }) =>
    get<PageResponse<Campground>>(API_ENDPOINTS.OWNER.CAMPGROUNDS, { params }),

  /**
   * Owner 대시보드 통계 조회
   */
  getDashboardStats: () =>
    get<OwnerDashboardStats>(API_ENDPOINTS.OWNER.DASHBOARD_STATS),

  /**
   * 내 캠핑장 상세 조회
   */
  getMyCampground: (id: number) =>
    get<CampgroundDetailResponse>(API_ENDPOINTS.OWNER.CAMPGROUND_DETAIL(id)),

  /**
   * 캠핑장 등록 (승인 대기)
   */
  createCampground: (data: FormData) =>
    post<CampgroundDetailResponse>(API_ENDPOINTS.OWNER.CAMPGROUNDS, data, {
      headers: {
        // FormData는 자동으로 Content-Type이 설정됨
      },
    }),

  /**
   * 캠핑장 정보 수정
   */
  updateCampground: (id: number, data: FormData) =>
    put<CampgroundDetailResponse>(
      API_ENDPOINTS.OWNER.CAMPGROUND_DETAIL(id),
      data
    ),

  /**
   * 캠핑장 삭제
   */
  deleteCampground: (id: number) =>
    del<void>(API_ENDPOINTS.OWNER.CAMPGROUND_DETAIL(id)),

  // ========== 구역(Site) 관리 ==========

  /**
   * 캠핑장의 구역 목록 조회
   */
  getSites: (campgroundId: number, params?: { page?: number; size?: number }) =>
    siteApi.getByCampground(campgroundId, params),

  /**
   * 구역 상세 조회
   */
  getSite: (siteId: number) => siteApi.getById(siteId),

  /**
   * 구역 추가
   */
  createSite: (data: SiteCreateRequest) => siteApi.create(data),

  /**
   * 구역 수정
   */
  updateSite: (siteId: number, data: SiteUpdateRequest) =>
    siteApi.update(siteId, data),

  /**
   * 구역 삭제
   */
  deleteSite: (siteId: number) => siteApi.delete(siteId),

  // ========== 예약 관리 ==========

  /**
   * 내 캠핑장의 예약 목록 조회
   */
  getReservations: (
    campgroundId?: number,
    params?: {
      status?: string;
      startDate?: string;
      endDate?: string;
      page?: number;
      size?: number;
    }
  ) => {
    const endpoint = campgroundId
      ? API_ENDPOINTS.OWNER.CAMPGROUND_RESERVATIONS(campgroundId)
      : API_ENDPOINTS.OWNER.RESERVATIONS;
    return get<PageResponse<Reservation>>(endpoint, { params });
  },

  /**
   * 예약 상세 조회 (Owner용)
   */
  getReservation: (reservationId: number) =>
    get<Reservation>(API_ENDPOINTS.OWNER.RESERVATION_DETAIL(reservationId)),

  /**
   * 예약 상태 변경 (확정/취소)
   */
  updateReservationStatus: (
    reservationId: number,
    status: "CONFIRMED" | "CANCELLED"
  ) =>
    put<{ data: Reservation }>(
      API_ENDPOINTS.OWNER.RESERVATION_STATUS(reservationId),
      { status }
    ),

  // ========== 통계 ==========

  /**
   * 내 캠핑장 통계
   */
  getStats: (
    campgroundId?: number,
    params?: {
      startDate?: string;
      endDate?: string;
    }
  ) => {
    const endpoint = campgroundId
      ? API_ENDPOINTS.OWNER.CAMPGROUND_STATS(campgroundId)
      : API_ENDPOINTS.OWNER.STATS;
    return get<{
      data: {
        totalReservations: number;
        reservationChange: number;
        totalRevenue: number;
        revenueChange: number;
        totalGuests: number;
        guestsChange: number;
        occupancyRate: number;
        occupancyChange: number;
      };
    }>(endpoint, { params });
  },

  /**
   * 월별 매출 통계
   */
  getRevenueStats: (campgroundId?: number, year?: number) => {
    const endpoint = campgroundId
      ? API_ENDPOINTS.OWNER.CAMPGROUND_REVENUE(campgroundId)
      : API_ENDPOINTS.OWNER.REVENUE;
    return get<{
      data: Array<{
        month: number;
        revenue: number;
        reservations: number;
      }>;
    }>(endpoint, { params: { year } });
  },

  // ========== 리뷰 관리 ==========

  /**
   * 내 캠핑장의 모든 리뷰 조회 (한 번의 API 호출)
   */
  getMyReviews: (params?: { page?: number; size?: number }) =>
    get<PageResponse<Review>>(API_ENDPOINTS.OWNER.REVIEWS, { params }),
};
