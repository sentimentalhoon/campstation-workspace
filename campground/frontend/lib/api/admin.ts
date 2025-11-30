/**
 * ADMIN API
 * 시스템 관리자(ADMIN) 전용 API 엔드포인트
 */

import { API_ENDPOINTS } from "@/lib/constants";
import type { Campground, PageResponse, Reservation, User } from "@/types";
import { bannersApi } from "./banners";
import { del, get, post, put } from "./client";
import {
  siteApi,
  type SiteCreateRequest,
  type SiteUpdateRequest,
} from "./sites";

// ============================================================
// Types
// ============================================================

/**
 * 사용자 역할 변경 요청
 */
export type UpdateUserRoleRequest = {
  role: "MEMBER" | "OWNER" | "ADMIN";
};

/**
 * 사용자 상태 변경 요청
 */
export type UpdateUserStatusRequest = {
  status: "ACTIVE" | "INACTIVE";
};

/**
 * 캠핑장 승인 상태
 */
export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";

/**
 * 캠핑장 승인 요청
 */
export type ApproveCampgroundRequest = {
  status: ApprovalStatus;
  rejectionReason?: string;
};

/**
 * 신고 타입
 */
export type ReportType = "REVIEW" | "CAMPGROUND" | "USER";

/**
 * 신고 상태
 */
export type ReportStatus = "PENDING" | "APPROVED" | "REJECTED";

/**
 * 신고 정보
 */
export type Report = {
  id: number;
  type: ReportType;
  targetId: number;
  targetTitle: string;
  reason: string;
  description?: string;
  reporterId: number;
  reporterName: string;
  reporterEmail: string;
  status: ReportStatus;
  processedBy?: number;
  processedAt?: string;
  createdAt: string;
};

/**
 * 신고 처리 요청
 */
export type ProcessReportRequest = {
  status: "APPROVED" | "REJECTED";
  note?: string;
};

/**
 * 전체 통계
 */
export type AdminStats = {
  users: {
    total: number;
    members: number;
    owners: number;
    admins: number;
    newThisMonth: number;
  };
  campgrounds: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
    newThisMonth: number;
  };
  reservations: {
    total: number;
    thisMonth: number;
    confirmed: number;
    cancelled: number;
  };
  revenue: {
    total: number;
    thisMonth: number;
    growth: number; // 전월 대비 증감률 (%)
  };
  reports: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
};

/**
 * 최근 활동
 */
export type RecentActivity = {
  id: number;
  type:
    | "USER_REGISTERED"
    | "CAMPGROUND_CREATED"
    | "RESERVATION_MADE"
    | "REVIEW_POSTED"
    | "REPORT_FILED";
  description: string;
  timestamp: string;
  userId?: number;
  userName?: string;
};

// ============================================================
// API
// ============================================================

/**
 * ADMIN 전용 API
 */
export const adminApi = {
  // ========== 사용자 관리 ==========

  /**
   * 전체 사용자 목록 조회
   */
  getAllUsers: (params?: {
    page?: number;
    size?: number;
    role?: "MEMBER" | "OWNER" | "ADMIN";
    status?: "ACTIVE" | "INACTIVE";
    search?: string;
  }) => get<PageResponse<User>>(API_ENDPOINTS.ADMIN.USERS, { params }),

  /**
   * 사용자 상세 조회
   */
  getUser: (userId: number) =>
    get<User>(API_ENDPOINTS.ADMIN.USER_DETAIL(userId)),

  /**
   * 사용자 역할 변경
   */
  updateUserRole: (userId: number, data: UpdateUserRoleRequest) =>
    put<User>(API_ENDPOINTS.ADMIN.USER_ROLE(userId), data),

  /**
   * 사용자 상태 변경
   */
  updateUserStatus: (userId: number, data: UpdateUserStatusRequest) =>
    put<User>(API_ENDPOINTS.ADMIN.USER_STATUS(userId), data),

  /**
   * 사용자 삭제
   */
  deleteUser: (userId: number) =>
    del<void>(API_ENDPOINTS.ADMIN.USER_DELETE(userId)),

  // ========== 캠핑장 관리 ==========

  /**
   * 전체 캠핑장 목록 조회
   */
  getAllCampgrounds: (params?: {
    page?: number;
    size?: number;
    status?: ApprovalStatus;
    search?: string;
  }) =>
    get<PageResponse<Campground>>(API_ENDPOINTS.ADMIN.CAMPGROUNDS, { params }),

  /**
   * 승인 대기 캠핑장 목록 (status=PENDING으로 필터링)
   */
  getPendingCampgrounds: (params?: { page?: number; size?: number }) =>
    get<PageResponse<Campground>>(API_ENDPOINTS.ADMIN.CAMPGROUNDS, {
      params: { ...params, status: "PENDING" },
    }),

  /**
   * 캠핑장 승인
   */
  approveCampground: (campgroundId: number) =>
    post<Campground>(API_ENDPOINTS.ADMIN.CAMPGROUND_APPROVE(campgroundId)),

  /**
   * 캠핑장 거부
   */
  rejectCampground: (campgroundId: number, reason: string) =>
    post<Campground>(API_ENDPOINTS.ADMIN.CAMPGROUND_REJECT(campgroundId), {
      reason,
    }),

  /**
   * 캠핑장 삭제
   */
  deleteCampground: (campgroundId: number) =>
    del<void>(API_ENDPOINTS.ADMIN.CAMPGROUND_DELETE(campgroundId)),

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
   * 전체 예약 목록 조회
   */
  getAllReservations: (params?: {
    page?: number;
    size?: number;
    status?: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
    startDate?: string;
    endDate?: string;
  }) =>
    get<PageResponse<Reservation>>(API_ENDPOINTS.ADMIN.RESERVATIONS, {
      params,
    }),

  /**
   * 예약 상세 조회
   */
  getReservation: (reservationId: number) =>
    get<Reservation>(API_ENDPOINTS.ADMIN.RESERVATION_DETAIL(reservationId)),

  /**
   * 예약 취소 (환불)
   */
  cancelReservation: (reservationId: number, reason?: string) =>
    post<void>(API_ENDPOINTS.ADMIN.RESERVATION_CANCEL(reservationId), {
      reason,
    }),

  // ========== 신고 관리 ==========

  /**
   * 전체 신고 목록 조회
   */
  getAllReports: (params?: {
    page?: number;
    size?: number;
    type?: ReportType;
    status?: ReportStatus;
  }) => get<PageResponse<Report>>(API_ENDPOINTS.ADMIN.REPORTS, { params }),

  /**
   * 신고 상세 조회
   */
  getReport: (reportId: number) =>
    get<Report>(API_ENDPOINTS.ADMIN.REPORT_DETAIL(reportId)),

  /**
   * 신고 처리
   */
  processReport: (reportId: number, data: ProcessReportRequest) =>
    put<Report>(API_ENDPOINTS.ADMIN.REPORT_PROCESS(reportId), data),

  // ========== 통계 ==========

  /**
   * 전체 시스템 통계
   */
  getStats: () => get<AdminStats>(API_ENDPOINTS.ADMIN.STATS),

  /**
   * 최근 활동
   */
  getRecentActivities: (params?: { limit?: number }) =>
    get<RecentActivity[]>(API_ENDPOINTS.ADMIN.ACTIVITIES, { params }),

  // ========== 배너 관리 ==========
  /**
   * 배너 관리 API
   * @see {@link bannersApi} for full API documentation
   */
  banners: bannersApi,
};
