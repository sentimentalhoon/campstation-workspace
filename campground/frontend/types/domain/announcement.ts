/**
 * 공지사항 도메인 타입
 */

import type { ImagePair } from "./image";

/**
 * 공지사항 타입
 * - NOTICE: 일반 공지사항
 * - EVENT: 이벤트 공지
 * - FACILITY: 시설 안내
 * - URGENT: 긴급 공지
 */
export type AnnouncementType = "NOTICE" | "EVENT" | "FACILITY" | "URGENT";

/**
 * 공지사항 상태
 */
export type AnnouncementStatus = "ACTIVE" | "INACTIVE";

/**
 * 공지사항
 */
export type Announcement = {
  id: number;
  campgroundId: number;
  type: AnnouncementType;
  title: string;
  content: string;
  images: ImagePair[];
  isPinned: boolean;
  status: AnnouncementStatus;
  viewCount: number;
  authorId: number;
  authorName: string;
  createdAt: string;
  updatedAt: string;
};

/**
 * 공지사항 생성 DTO
 */
export type CreateAnnouncementDto = {
  campgroundId: number;
  type: AnnouncementType;
  title: string;
  content: string;
  images?: ImagePair[];
  isPinned?: boolean;
  status?: AnnouncementStatus;
};

/**
 * 공지사항 수정 DTO
 */
export type UpdateAnnouncementDto = {
  type?: AnnouncementType;
  title?: string;
  content?: string;
  images?: ImagePair[];
  isPinned?: boolean;
  status?: AnnouncementStatus;
};

/**
 * 공지사항 검색 파라미터
 */
export type AnnouncementSearchParams = {
  campgroundId: number;
  type?: AnnouncementType;
  status?: AnnouncementStatus;
  page?: number;
  size?: number;
  sortBy?: "createdAt" | "viewCount" | "isPinned";
  order?: "asc" | "desc";
};
