/**
 * 라우트 상수
 * 애플리케이션 내 모든 경로를 중앙에서 관리
 */

export const ROUTES = {
  HOME: "/",

  // 인증
  AUTH: {
    LOGIN: "/login",
    REGISTER: "/register",
    FORGOT_PASSWORD: "/forgot-password",
    CALLBACK: "/auth/callback",
  },

  // 캠핑장
  CAMPGROUNDS: {
    LIST: "/campgrounds",
    SEARCH: "/campgrounds/search",
    DETAIL: (id: number) => `/campgrounds/${id}`,
    SITES: (id: number) => `/campgrounds/${id}/sites`,
  },

  // 예약
  RESERVATIONS: {
    LIST: "/reservations",
    NEW: "/reservations/new",
    DETAIL: (id: number) => `/reservations/${id}`,
    GUEST: "/reservations/guest",
    GUEST_DETAIL: (id: number) => `/reservations/guest/${id}`,
    REVIEW_NEW: (id: number) => `/reservations/${id}/review/new`,
  },

  // 리뷰
  REVIEWS: {
    EDIT: (id: number) => `/reviews/${id}/edit`,
  },

  // 결제
  PAYMENT: {
    MAIN: "/payment",
    SUCCESS: "/payment/success",
    FAIL: "/payment/fail",
    TRANSFER_PENDING: "/payment/transfer-pending",
  },

  // 지도
  MAP: "/map",

  // 에러 페이지
  ERROR: {
    UNAUTHORIZED: "/error/401",
    FORBIDDEN: "/error/403",
    SERVER_ERROR: "/error/500",
  },

  // 대시보드 - 사용자
  DASHBOARD: {
    USER: "/dashboard/user",
    PROFILE: "/dashboard/user/profile",
    REVIEWS: "/dashboard/user/reviews",
    FAVORITES: "/dashboard/user/favorites",

    // 대시보드 - Owner
    OWNER: "/dashboard/owner",
    OWNER_ANALYTICS: "/dashboard/owner/analytics",
    OWNER_REVIEWS: "/dashboard/owner/reviews",
    OWNER_RESERVATIONS: "/dashboard/owner/reservations",
    OWNER_RESERVATION_DETAIL: (id: number) =>
      `/dashboard/owner/reservations/${id}`,
    OWNER_CAMPGROUNDS_NEW: "/dashboard/owner/campgrounds/new",
    OWNER_CAMPGROUND_EDIT: (id: number) =>
      `/dashboard/owner/campgrounds/${id}/edit`,
    OWNER_CAMPGROUND_SITES: (id: number) =>
      `/dashboard/owner/campgrounds/${id}/sites`,
    OWNER_CAMPGROUND_SITES_PRICING: (id: number) =>
      `/dashboard/owner/campgrounds/${id}/sites/pricing`,
    OWNER_CAMPGROUND_RESERVATIONS: (id: number) =>
      `/dashboard/owner/campgrounds/${id}/reservations`,

    // 대시보드 - Admin
    ADMIN: "/dashboard/admin",
    ADMIN_USERS: "/dashboard/admin/users",
    ADMIN_CAMPGROUNDS: "/dashboard/admin/campgrounds",
    ADMIN_RESERVATIONS: "/dashboard/admin/reservations",
    ADMIN_REPORTS: "/dashboard/admin/reports",
    ADMIN_BANNERS: "/dashboard/admin/banners",
    ADMIN_BANNERS_CREATE: "/dashboard/admin/banners/create",
    ADMIN_BANNER_EDIT: (id: number) => `/dashboard/admin/banners/${id}/edit`,
  },
} as const;
