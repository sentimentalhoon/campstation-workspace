/**
 * API 엔드포인트 상수
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export const API_ENDPOINTS = {
  // 인증
  AUTH: {
    LOGIN: "/v1/auth/login",
    REGISTER: "/v1/auth/signup",
    LOGOUT: "/v1/auth/logout",
    REFRESH: "/v1/auth/refresh",
    ME: "/v1/auth/me",
  },

  // 캠핑장
  CAMPGROUNDS: {
    LIST: "/v1/campgrounds",
    DETAIL: (id: number) => `/v1/campgrounds/${id}`,
    CREATE: "/v1/campgrounds",
    UPDATE: (id: number) => `/v1/campgrounds/${id}`,
    DELETE: (id: number) => `/v1/campgrounds/${id}`,
    SITES: (id: number) => `/v1/campgrounds/${id}/sites`,
  },

  // 예약
  RESERVATIONS: {
    LIST: "/v1/reservations/my",
    DETAIL: (id: number) => `/v1/reservations/${id}`,
    CREATE: "/v1/reservations",
    UPDATE: (id: number) => `/v1/reservations/${id}`,
    CANCEL: (id: number) => `/v1/reservations/${id}/cancel`,
    GUEST: "/v1/reservations/guest",
    SITE_RESERVED_DATES: (siteId: number) =>
      `/v1/reservations/sites/${siteId}/reserved-dates`,
    CAMPGROUND_RESERVED_DATES: (campgroundId: number) =>
      `/v1/reservations/campgrounds/${campgroundId}/reserved-dates`,
  },

  // 리뷰
  REVIEWS: {
    LIST: (campgroundId: number) => `/v1/reviews/campground/${campgroundId}`,
    CREATE: `/v1/reviews`, // POST - body에 campgroundId, reservationId 포함
    UPDATE: (id: number) => `/v1/reviews/${id}`,
    DELETE: (id: number) => `/v1/reviews/${id}`,
    MY: `/v1/reviews/my`, // GET - 내 리뷰 목록
    DETAIL: (id: number) => `/v1/reviews/${id}`,
    LIKE: (id: number) => `/v1/reviews/${id}/like`,
    UNLIKE: (id: number) => `/v1/reviews/${id}/like`,
    REPORT: (id: number) => `/v1/reviews/${id}/report`,
    RECENT: `/v1/reviews/recent`,
    REPLY: {
      CREATE: (reviewId: number) => `/v1/reviews/${reviewId}/reply`,
      UPDATE: (reviewId: number, replyId: number) =>
        `/v1/reviews/${reviewId}/reply/${replyId}`,
      DELETE: (reviewId: number, replyId: number) =>
        `/v1/reviews/${reviewId}/reply/${replyId}`,
    },
  },

  // 결제
  PAYMENTS: {
    PROCESS: "/v1/payments",
    VERIFY: (id: string) => `/v1/payments/${id}/verify`,
    CONFIRM: (id: number) => `/v1/payments/${id}/confirm`,
    REQUEST_CONFIRMATION: (id: number) =>
      `/v1/payments/${id}/request-confirmation`,
    CONFIRM_DEPOSIT: (id: number) => `/v1/payments/${id}/confirm-deposit`,
  },

  // 파일 업로드
  FILES: {
    UPLOAD: "/v1/files/upload",
    UPLOAD_MULTIPLE: "/v1/files/upload/multiple",
    DELETE: "/v1/files",
  },

  // 캠핑장 (추가)
  CAMPGROUNDS_EXT: {
    POPULAR: "/v1/campgrounds/popular",
    SEARCH: "/v1/campgrounds/search",
  },

  // 사이트
  SITES: {
    BY_CAMPGROUND: (campgroundId: number) =>
      `/v1/sites/by-campground/${campgroundId}`,
    DETAIL: (id: number) => `/v1/sites/${id}`,
    CREATE: "/v1/sites",
    UPDATE: (id: number) => `/v1/sites/${id}`,
    DELETE: (id: number) => `/v1/sites/${id}`,
  },

  // 사용자
  USERS: {
    PROFILE: "/v1/users/profile",
    PASSWORD: "/v1/users/password",
  },

  // OAuth
  OAUTH: {
    KAKAO: "/v1/auth/oauth/kakao",
    NAVER: "/v1/auth/oauth/naver",
  },

  // 찜하기
  FAVORITES: {
    TOGGLE: "/v1/favorites/toggle",
    ADD: (campgroundId: number) => `/v1/favorites/campgrounds/${campgroundId}`,
    REMOVE: (campgroundId: number) =>
      `/v1/favorites/campgrounds/${campgroundId}`,
    LIST: "/v1/favorites",
    ALL: "/v1/favorites/all",
    STATUS: (campgroundId: number) =>
      `/v1/favorites/campgrounds/${campgroundId}/status`,
    COUNT: (campgroundId: number) =>
      `/v1/favorites/campgrounds/${campgroundId}/count`,
  },

  // Owner API
  OWNER: {
    CAMPGROUNDS: "/v1/owner/campgrounds",
    CAMPGROUND_DETAIL: (id: number) => `/v1/owner/campgrounds/${id}`,
    DASHBOARD_STATS: "/v1/owner/dashboard/stats",
    RESERVATIONS: "/v1/owner/reservations",
    CAMPGROUND_RESERVATIONS: (campgroundId: number) =>
      `/v1/owner/campgrounds/${campgroundId}/reservations`,
    RESERVATION_DETAIL: (id: number) => `/v1/owner/reservations/${id}`,
    RESERVATION_STATUS: (id: number) => `/v1/owner/reservations/${id}/status`,
    STATS: "/v1/owner/stats",
    CAMPGROUND_STATS: (campgroundId: number) =>
      `/v1/owner/campgrounds/${campgroundId}/stats`,
    REVENUE: "/v1/owner/stats/revenue",
    CAMPGROUND_REVENUE: (campgroundId: number) =>
      `/v1/owner/campgrounds/${campgroundId}/stats/revenue`,
    REVIEWS: "/v1/owner/reviews",
    PRICING: (siteId: number) => `/v1/owner/sites/${siteId}/pricing`,
    PRICING_LIST: (siteId: number) => `/v1/owner/sites/${siteId}/pricing`,
    PRICING_UPDATE: (siteId: number, pricingId: number) =>
      `/v1/owner/sites/${siteId}/pricing/${pricingId}`,
    PRICING_DELETE: (siteId: number, pricingId: number) =>
      `/v1/owner/sites/${siteId}/pricing/${pricingId}`,
    ALL_PRICING: "/v1/owner/pricing",
    CALCULATE_PRICE: "/v1/pricing/calculate",
  },

  // Admin API
  ADMIN: {
    USERS: "/v1/admin/users",
    USER_DETAIL: (id: number) => `/v1/admin/users/${id}`,
    USER_ROLE: (id: number) => `/v1/admin/users/${id}/role`,
    USER_STATUS: (id: number) => `/v1/admin/users/${id}/status`,
    USER_DELETE: (id: number) => `/v1/admin/users/${id}`,
    CAMPGROUNDS: "/v1/admin/campgrounds",
    CAMPGROUND_APPROVE: (id: number) => `/v1/admin/campgrounds/${id}/approve`,
    CAMPGROUND_REJECT: (id: number) => `/v1/admin/campgrounds/${id}/reject`,
    CAMPGROUND_DELETE: (id: number) => `/v1/admin/campgrounds/${id}`,
    RESERVATIONS: "/v1/admin/reservations",
    RESERVATION_DETAIL: (id: number) => `/v1/admin/reservations/${id}`,
    RESERVATION_CANCEL: (id: number) => `/v1/admin/reservations/${id}/cancel`,
    REPORTS: "/v1/admin/reports",
    REPORT_DETAIL: (id: number) => `/v1/admin/reports/${id}`,
    REPORT_PROCESS: (id: number) => `/v1/admin/reports/${id}/process`,
    STATS: "/v1/admin/dashboard/stats",
    ACTIVITIES: "/v1/admin/dashboard/recent-activities",
    BANNERS: "/v1/admin/banners",
    BANNER_DETAIL: (id: number) => `/v1/admin/banners/${id}`,
    BANNER_STATUS: (id: number) => `/v1/admin/banners/${id}/status`,
    BANNER_ORDER: "/v1/admin/banners/order",
    BANNER_STATS: "/v1/admin/banners/stats",
  },

  // Banners (Public)
  BANNERS: {
    LIST: "/v1/banners",
    VIEW: (id: number) => `/v1/banners/${id}/view`,
    CLICK: (id: number) => `/v1/banners/${id}/click`,
  },

  // Stats (조회수 추적)
  STATS: {
    RECORD_VIEW: (campgroundId: number) =>
      `/v1/campgrounds/${campgroundId}/view-log`,
    RECORD_DURATION: (campgroundId: number) =>
      `/v1/campgrounds/${campgroundId}/view-duration`,
    GET_STATS: (campgroundId: number) => `/v1/campgrounds/${campgroundId}/stats`,
    GET_VIEW_COUNT: (campgroundId: number) =>
      `/v1/campgrounds/${campgroundId}/view-count`,
  },

  // 가격 계산 (Public API)
  PRICING: {
    CALCULATE: "/v1/pricing/calculate",
    CALCULATE_BY_SITE: (siteId: number) =>
      `/v1/pricing/sites/${siteId}/calculate`,
  },
} as const;
