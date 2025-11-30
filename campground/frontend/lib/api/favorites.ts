/**
 * Favorites API
 *
 * 찜하기 관련 API 엔드포인트
 *
 * @see docs/specifications/04-API-SPEC.md
 */

import { API_ENDPOINTS } from "@/lib/constants";
import type { Favorite, FavoriteToggleRequest, PageResponse } from "@/types";
import { del, get, post } from "./client";

/**
 * 찜하기 API
 */
export const favoriteApi = {
  /**
   * 찜하기 토글 (추가/제거)
   * @description 이미 찜한 경우 제거, 아닌 경우 추가
   */
  toggle: (data: FavoriteToggleRequest) =>
    post<Favorite>(API_ENDPOINTS.FAVORITES.TOGGLE, data),

  /**
   * 찜하기 추가
   */
  add: (campgroundId: number) =>
    post<Favorite>(API_ENDPOINTS.FAVORITES.ADD(campgroundId)),

  /**
   * 찜하기 제거
   */
  remove: (campgroundId: number) =>
    del<void>(API_ENDPOINTS.FAVORITES.REMOVE(campgroundId)),

  /**
   * 찜 목록 조회 (페이징)
   */
  getList: (params?: { page?: number; size?: number }) =>
    get<PageResponse<Favorite>>(API_ENDPOINTS.FAVORITES.LIST, { params }),

  /**
   * 찜 목록 전체 조회
   */
  getAll: () => get<Favorite[]>(API_ENDPOINTS.FAVORITES.ALL),

  /**
   * 찜 상태 확인
   */
  checkStatus: (campgroundId: number) =>
    get<boolean>(API_ENDPOINTS.FAVORITES.STATUS(campgroundId)),

  /**
   * 찜 개수 조회
   */
  getCount: (campgroundId: number) =>
    get<number>(API_ENDPOINTS.FAVORITES.COUNT(campgroundId)),
};
