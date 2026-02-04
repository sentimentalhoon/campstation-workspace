/**
 * 캠핑장 API
 *
 * @module lib/api/campgrounds
 * @description 캠핑장 조회, 검색, 생성, 수정, 삭제 관련 API
 */

import { API_ENDPOINTS } from "@/lib/constants";
import type {
  Campground,
  CampgroundSearchParams,
  CreateCampgroundRequest,
  PageResponse,
  Site,
  UpdateCampgroundRequest,
} from "@/types";
import { del, get, post, put } from "./client";

/**
 * 캠핑장 관련 API
 */
export const campgroundApi = {
  /**
   * 캠핑장 목록 조회 (페이징)
   *
   * @param params - 검색 및 페이징 파라미터
   * @param params.page - 페이지 번호 (0부터 시작)
   * @param params.size - 페이지 크기
   * @param params.location - 지역 필터
   * @param params.amenities - 편의시설 필터
   * @returns 캠핑장 목록 (페이지네이션)
   *
   * @example
   * ```ts
   * const result = await campgroundApi.getAll({
   *   page: 0,
   *   size: 10,
   *   location: "강원도"
   * });
   * ```
   */
  getAll: (params?: CampgroundSearchParams) =>
    get<PageResponse<Campground>>(API_ENDPOINTS.CAMPGROUNDS.LIST, { params }),

  /**
   * 캠핑장 상세 조회
   *
   * @param id - 캠핑장 ID
   * @returns 캠핑장 상세 정보
   * @throws {ApiError} 404 - 캠핑장을 찾을 수 없음
   *
   * @example
   * ```ts
   * const campground = await campgroundApi.getById(1);
   * console.log(campground.name);
   * ```
   */
  getById: (id: number) =>
    get<Campground>(API_ENDPOINTS.CAMPGROUNDS.DETAIL(id), {
      skipAuthRefresh: true,
    }),

  /**
   * 캠핑장 사이트 목록 조회
   *
   * @param id - 캠핑장 ID
   * @returns 사이트 목록 (페이지네이션)
   * @throws {ApiError} 404 - 캠핑장을 찾을 수 없음
   *
   * @example
   * ```ts
   * const sites = await campgroundApi.getSites(1);
   * ```
   */
  getSites: (id: number) =>
    get<PageResponse<Site>>(API_ENDPOINTS.CAMPGROUNDS.SITES(id), {
      skipAuthRefresh: true,
    }),

  /**
   * 캠핑장 검색
   *
   * @param params - 검색 파라미터
   * @returns 검색 결과 (페이지네이션)
   *
   * @example
   * ```ts
   * const results = await campgroundApi.search({
   *   location: "경기도",
   *   amenities: ["전기", "wifi"]
   * });
   * ```
   */
  search: (params?: CampgroundSearchParams) =>
    get<PageResponse<Campground>>(API_ENDPOINTS.CAMPGROUNDS_EXT.SEARCH, {
      params,
    }),

  /**
   * 캠핑장 생성 (Owner 전용)
   *
   * @param data - 캠핑장 생성 정보
   * @returns 생성된 캠핑장 정보
   * @throws {ApiError} 403 - 권한 없음, 400 - 검증 실패
   *
   * @example
   * ```ts
   * const newCampground = await campgroundApi.create({
   *   name: "아름다운 캠핑장",
   *   location: "강원도 춘천시",
   *   description: "자연 속의 힐링",
   *   amenities: ["전기", "화장실", "샤워실"]
   * });
   * ```
   */
  create: (data: CreateCampgroundRequest) =>
    post<Campground>(API_ENDPOINTS.CAMPGROUNDS.CREATE, data),

  /**
   * 캠핑장 수정 (Owner 전용)
   *
   * @param id - 캠핑장 ID
   * @param data - 수정할 캠핑장 정보
   * @returns 수정된 캠핑장 정보
   * @throws {ApiError} 403 - 권한 없음, 404 - 캠핑장을 찾을 수 없음
   *
   * @example
   * ```ts
   * const updated = await campgroundApi.update(1, {
   *   name: "새로운 캠핑장 이름"
   * });
   * ```
   */
  update: (id: number, data: UpdateCampgroundRequest) =>
    put<Campground>(API_ENDPOINTS.CAMPGROUNDS.UPDATE(id), data),

  /**
   * 캠핑장 삭제 (Owner 전용)
   *
   * @param id - 캠핑장 ID
   * @returns void
   * @throws {ApiError} 403 - 권한 없음, 404 - 캠핑장을 찾을 수 없음
   *
   * @example
   * ```ts
   * await campgroundApi.delete(1);
   * ```
   */
  delete: (id: number) => del<void>(API_ENDPOINTS.CAMPGROUNDS.DELETE(id)),
};
