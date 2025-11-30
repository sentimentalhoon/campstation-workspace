/**
 * 찜하기 도메인 타입
 *
 * @see docs/specifications/05-DATA-MODELS.md
 */

/**
 * 찜하기 응답 타입
 */
export type Favorite = {
  id: number;
  campgroundId: number;
  campgroundName: string;
  campgroundAddress: string;
  createdAt: string;
};

/**
 * 찜하기 토글 요청 타입
 */
export type FavoriteToggleRequest = {
  campgroundId: number;
};
