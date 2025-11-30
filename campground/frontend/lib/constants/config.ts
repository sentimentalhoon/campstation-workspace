/**
 * 애플리케이션 설정 상수
 */

export const APP_CONFIG = {
  NAME: "CampStation",
  DESCRIPTION: "캠핑장 예약 플랫폼",
  URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",

  // 페이지네이션
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,

  // 이미지
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp"],

  // 예약
  MIN_RESERVATION_DAYS: 1,
  MAX_RESERVATION_DAYS: 30,
  CANCEL_DEADLINE_HOURS: 24,

  // 리뷰
  MIN_REVIEW_LENGTH: 10,
  MAX_REVIEW_LENGTH: 1000,
  MIN_RATING: 1,
  MAX_RATING: 5,
} as const;

/**
 * React Query 설정
 * @see docs/technical/caching-strategy.md
 */
export const QUERY_CONFIG = {
  STALE_TIME: {
    DEFAULT: 60 * 1000, // 1분
    SHORT: 30 * 1000, // 30초 (실시간성 필요)
    MEDIUM: 5 * 60 * 1000, // 5분 (준실시간성)
    LONG: 10 * 60 * 1000, // 10분 (정적 데이터)
    VERY_LONG: 30 * 60 * 1000, // 30분 (거의 변경 안 됨)
  },
  GC_TIME: {
    DEFAULT: 5 * 60 * 1000, // 5분
    SHORT: 3 * 60 * 1000, // 3분
    MEDIUM: 10 * 60 * 1000, // 10분
    LONG: 15 * 60 * 1000, // 15분
  },
  RETRY: 3,
  RETRY_DELAY: 1000,
} as const;

/**
 * 로컬 스토리지 키
 */
export const STORAGE_KEYS = {
  AUTH_TOKEN: "campstation-auth-token",
  REFRESH_TOKEN: "campstation-refresh-token",
  THEME: "campstation-theme",
  RECENT_SEARCHES: "campstation-recent-searches",
  FILTER_PREFERENCES: "campstation-filter-preferences",
} as const;
