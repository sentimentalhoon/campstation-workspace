/**
 * 리뷰 도메인 타입
 */

import type { ImagePair } from "./image";

export type Review = {
  id: number;
  campgroundId: number;
  campgroundName: string;
  campgroundOwnerId: number; // 캠핑장 소유자 ID (OWNER 권한 체크용)
  userId: number;
  userName: string;
  rating: number;
  comment: string;
  images: ImagePair[];
  likeCount: number;
  isLiked?: boolean; // 현재 사용자가 좋아요 했는지 여부
  createdAt: string;
  updatedAt: string;
  ownerReply?: ReviewReply; // 운영자 답글
};

export type ReviewReply = {
  id: number;
  reviewId: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateReviewReplyDto = {
  comment: string;
};

export type UpdateReviewReplyDto = {
  comment: string;
};

export type CreateReviewDto = {
  campgroundId: number;
  reservationId?: number; // OWNER/ADMIN은 예약 없이도 작성 가능
  rating: number;
  comment: string;
  images?: ImagePair[]; // 통일된 이미지 형식
};

export type UpdateReviewDto = {
  rating?: number;
  comment?: string;
  images?: ImagePair[]; // 새로 추가할 이미지
  imageIdsToDelete?: number[]; // 삭제할 이미지 ID
};

export type ReviewSearchParams = {
  campgroundId?: number;
  minRating?: number;
  page?: number;
  size?: number;
  sort?: string;
};

export type ReviewSortOption = "latest" | "rating" | "likes";

export type ReviewStats = {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    "5": number;
    "4": number;
    "3": number;
    "2": number;
    "1": number;
  };
};
