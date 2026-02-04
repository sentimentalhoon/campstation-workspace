/**
 * 캠핑장 조회수 및 통계 API
 *
 * @module lib/api/stats
 * @description 캠핑장 페이지 조회 추적, 통계 조회 관련 API
 */

import { API_ENDPOINTS } from "@/lib/constants";
import type {
  CampgroundStats,
  RecordDurationRequest,
  RecordViewRequest,
  StatsQueryParams,
  ViewCountResponse,
} from "@/types";
import { get, post } from "./client";

/**
 * 캠핑장 조회수 및 통계 관련 API
 */
export const statsApi = {
  /**
   * 캠핑장 페이지 조회 기록
   *
   * @param campgroundId - 캠핑장 ID
   * @param data - 조회 기록 데이터 (sessionId, referrer, userAgent)
   * @returns void
   *
   * @example
   * ```ts
   * await statsApi.recordView(1, {
   *   sessionId: "abc123",
   *   referrer: "https://google.com"
   * });
   * ```
   */
  recordView: (campgroundId: number, data: RecordViewRequest) =>
    post<void>(API_ENDPOINTS.STATS.RECORD_VIEW(campgroundId), data, {
      skipAuthRefresh: true,
    }),

  /**
   * 캠핑장 페이지 체류 시간 기록
   *
   * @param campgroundId - 캠핑장 ID
   * @param data - 체류 시간 데이터 (sessionId, duration)
   * @returns void
   *
   * @example
   * ```ts
   * await statsApi.recordDuration(1, {
   *   sessionId: "abc123",
   *   duration: 120 // 초
   * });
   * ```
   */
  recordDuration: (campgroundId: number, data: RecordDurationRequest) =>
    post<void>(API_ENDPOINTS.STATS.RECORD_DURATION(campgroundId), data, {
      skipAuthRefresh: true,
    }),

  /**
   * 캠핑장 통계 조회 (Owner Dashboard용)
   *
   * @param campgroundId - 캠핑장 ID
   * @param params - 조회 파라미터 (days, startDate, endDate)
   * @returns 캠핑장 통계 데이터
   * @throws {ApiError} 404 - 캠핑장을 찾을 수 없음, 403 - 권한 없음
   *
   * @example
   * ```ts
   * const stats = await statsApi.getStats(1, { days: 30 });
   * console.log(stats.totalUniqueVisitors);
   * ```
   */
  getStats: (campgroundId: number, params?: StatsQueryParams) =>
    get<CampgroundStats>(API_ENDPOINTS.STATS.GET_STATS(campgroundId), {
      params,
    }),

  /**
   * 캠핑장 조회수 조회 (실시간)
   *
   * @param campgroundId - 캠핑장 ID
   * @param period - 조회 기간 ("24h", "7d", "30d")
   * @returns 조회수 데이터
   *
   * @example
   * ```ts
   * const viewCount = await statsApi.getViewCount(1, "24h");
   * console.log(`조회수: ${viewCount.viewCount}`);
   * ```
   */
  getViewCount: (campgroundId: number, period: "24h" | "7d" | "30d" = "24h") =>
    get<ViewCountResponse>(API_ENDPOINTS.STATS.GET_VIEW_COUNT(campgroundId), {
      params: { period },
    }),
};
