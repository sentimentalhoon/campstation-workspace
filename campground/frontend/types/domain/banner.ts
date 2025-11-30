/**
 * 배너 도메인 타입
 * 메인 페이지 프로모션 배너 관리
 */

import type { ImagePair } from "./image";

/**
 * 배너 상태
 */
export type BannerStatus = "ACTIVE" | "INACTIVE" | "SCHEDULED";

/**
 * 배너 타입
 */
export type BannerType = "PROMOTION" | "EVENT" | "ANNOUNCEMENT" | "NOTICE";

/**
 * 배너 정보
 */
export type Banner = {
  id: number;
  title: string;
  description?: string;
  type: BannerType;
  image: ImagePair; // 통일된 이미지 형식 (썸네일 + 원본)
  linkUrl?: string; // 클릭 시 이동할 URL
  linkTarget?: "_self" | "_blank"; // 링크 열기 방식
  displayOrder: number; // 노출 순서 (낮을수록 먼저)
  status: BannerStatus; // 배너 상태
  startDate?: string; // 노출 시작일 (ISO 8601)
  endDate?: string; // 노출 종료일 (ISO 8601)
  viewCount: number; // 조회수
  clickCount: number; // 클릭수
  createdBy?: number; // 생성자 ID (ADMIN) - 옵션
  createdAt: string;
  updatedAt: string;
};

/**
 * 배너 생성 요청
 */
export type CreateBannerDto = {
  title: string;
  description?: string;
  type: BannerType;
  image: ImagePair; // 이미지 업로드 후 받은 ImagePair
  linkUrl?: string;
  linkTarget?: "_self" | "_blank";
  displayOrder?: number; // 미지정 시 마지막 순서
  status?: BannerStatus; // 미지정 시 INACTIVE
  startDate?: string; // ISO 8601 형식
  endDate?: string; // ISO 8601 형식
};

/**
 * 배너 수정 요청
 */
export type UpdateBannerDto = {
  title?: string;
  description?: string;
  type?: BannerType;
  image?: ImagePair; // 이미지 변경 시
  linkUrl?: string;
  linkTarget?: "_self" | "_blank";
  displayOrder?: number;
  status?: BannerStatus;
  startDate?: string;
  endDate?: string;
};

/**
 * 배너 검색 파라미터
 */
export type BannerSearchParams = {
  title?: string; // 제목 검색
  status?: BannerStatus;
  type?: BannerType;
  page?: number;
  size?: number;
  sort?: "displayOrder" | "createdAt" | "viewCount" | "clickCount";
  direction?: "asc" | "desc";
};

/**
 * 배너 순서 변경 요청
 */
export type UpdateBannerOrderDto = {
  bannerId: number;
  displayOrder: number;
}[];

/**
 * 배너 통계
 */
export type BannerStats = {
  totalBanners: number;
  activeBanners: number;
  inactiveBanners: number;
  scheduledBanners: number;
  totalViews: number;
  totalClicks: number;
  averageCtr: number; // Click-Through Rate (%)
};
