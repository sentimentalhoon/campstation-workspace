/**
 * API 설정
 */

export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api",
  TIMEOUT: 30000, // 30초
  RETRY_COUNT: 3,
  RETRY_DELAY: 1000,
} as const;
