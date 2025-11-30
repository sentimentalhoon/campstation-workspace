/**
 * 공지사항 API
 *
 * @module lib/api/announcements
 * @description 캠핑장 공지사항 조회, 생성, 수정, 삭제 관련 API
 */

import type {
  Announcement,
  AnnouncementSearchParams,
  CreateAnnouncementDto,
  UpdateAnnouncementDto,
} from "@/types";
import { del, get, post, put } from "./client";

/**
 * 공지사항 관련 API
 */
export const announcementApi = {
  /**
   * 캠핑장 공지사항 목록 조회
   *
   * @param params - 검색 파라미터
   * @returns 공지사항 목록 (배열)
   *
   * @example
   * ```ts
   * const result = await announcementApi.getAll({
   *   campgroundId: 1,
   *   type: "NOTICE",
   *   page: 0,
   *   size: 10
   * });
   * ```
   */
  getAll: (params: AnnouncementSearchParams) =>
    get<Announcement[]>("/v1/announcements", { params }),

  /**
   * 공지사항 상세 조회
   *
   * @param id - 공지사항 ID
   * @returns 공지사항 상세 정보
   * @throws {ApiError} 404 - 공지사항을 찾을 수 없음
   *
   * @example
   * ```ts
   * const announcement = await announcementApi.getById(1);
   * ```
   */
  getById: (id: number) => get<Announcement>(`/v1/announcements/${id}`),

  /**
   * 공지사항 생성 (OWNER only)
   *
   * @param data - 공지사항 생성 데이터
   * @returns 생성된 공지사항
   * @throws {ApiError} 401 - 인증 필요
   * @throws {ApiError} 403 - 권한 없음 (OWNER만 가능)
   * @throws {ApiError} 400 - 잘못된 요청
   *
   * @example
   * ```ts
   * const newAnnouncement = await announcementApi.create({
   *   campgroundId: 1,
   *   type: "NOTICE",
   *   title: "시설 점검 안내",
   *   content: "2024년 1월 15일 시설 점검이 있습니다.",
   *   isPinned: false
   * });
   * ```
   */
  create: (data: CreateAnnouncementDto) =>
    post<Announcement>("/v1/announcements", data),

  /**
   * 공지사항 수정 (OWNER only)
   *
   * @param id - 공지사항 ID
   * @param data - 수정할 데이터
   * @returns 수정된 공지사항
   * @throws {ApiError} 401 - 인증 필요
   * @throws {ApiError} 403 - 권한 없음
   * @throws {ApiError} 404 - 공지사항을 찾을 수 없음
   *
   * @example
   * ```ts
   * const updated = await announcementApi.update(1, {
   *   title: "수정된 제목",
   *   isPinned: true
   * });
   * ```
   */
  update: (id: number, data: UpdateAnnouncementDto) =>
    put<Announcement>(`/v1/announcements/${id}`, data),

  /**
   * 공지사항 삭제 (OWNER only)
   *
   * @param id - 공지사항 ID
   * @throws {ApiError} 401 - 인증 필요
   * @throws {ApiError} 403 - 권한 없음
   * @throws {ApiError} 404 - 공지사항을 찾을 수 없음
   *
   * @example
   * ```ts
   * await announcementApi.delete(1);
   * ```
   */
  delete: (id: number) => del<void>(`/v1/announcements/${id}`),

  /**
   * 공지사항 조회수 증가
   *
   * @param id - 공지사항 ID
   * @returns 업데이트된 공지사항
   *
   * @example
   * ```ts
   * await announcementApi.incrementViewCount(1);
   * ```
   */
  incrementViewCount: (id: number) =>
    post<Announcement>(`/v1/announcements/${id}/views`, {}),
};
