/**
 * 리뷰 API
 */

import { API_ENDPOINTS } from "@/lib/constants";
import type {
  CreateReviewReplyDto,
  CreateReviewRequest,
  CreateReviewResponse,
  PageResponse,
  Review,
  ReviewReply,
  ReviewSearchParams,
  UpdateReviewReplyDto,
  UpdateReviewRequest,
  UpdateReviewResponse,
} from "@/types";
import { del, get, post, put } from "./client";

export const reviewApi = {
  /**
   * 리뷰 목록 조회
   */
  getAll: (
    campgroundId: number,
    params?: Omit<ReviewSearchParams, "campgroundId">
  ) =>
    get<PageResponse<Review>>(API_ENDPOINTS.REVIEWS.LIST(campgroundId), {
      params,
    }),

  /**
   * 내 리뷰 목록 조회
   */
  getMyReviews: (params?: { page?: number; size?: number }) =>
    get<PageResponse<Review>>(API_ENDPOINTS.REVIEWS.MY, { params }),

  /**
   * 리뷰 상세 조회
   */
  getById: (id: number) => get<Review>(API_ENDPOINTS.REVIEWS.DETAIL(id)),

  /**
   * 리뷰 작성
   * @param data - campgroundId, reservationId, rating, comment, imageUrls 포함
   */
  create: (data: CreateReviewRequest) =>
    post<CreateReviewResponse>(API_ENDPOINTS.REVIEWS.CREATE, data),

  /**
   * 리뷰 수정
   */
  update: (id: number, data: UpdateReviewRequest) =>
    put<UpdateReviewResponse>(API_ENDPOINTS.REVIEWS.UPDATE(id), data),

  /**
   * 리뷰 삭제
   */
  delete: (id: number) => del<void>(API_ENDPOINTS.REVIEWS.DELETE(id)),

  /**
   * 리뷰 좋아요
   */
  like: (id: number) => post<void>(API_ENDPOINTS.REVIEWS.LIKE(id), {}),

  /**
   * 리뷰 좋아요 취소
   */
  unlike: (id: number) => del<void>(API_ENDPOINTS.REVIEWS.UNLIKE(id)),

  /**
   * 리뷰 신고
   */
  report: (id: number, data: { reason: string }) =>
    post<void>(API_ENDPOINTS.REVIEWS.REPORT(id), data),

  /**
   * 운영자 답글 작성
   */
  createReply: (reviewId: number, data: CreateReviewReplyDto) =>
    post<ReviewReply>(API_ENDPOINTS.REVIEWS.REPLY.CREATE(reviewId), data),

  /**
   * 운영자 답글 수정
   */
  updateReply: (
    reviewId: number,
    replyId: number,
    data: UpdateReviewReplyDto
  ) =>
    put<ReviewReply>(
      API_ENDPOINTS.REVIEWS.REPLY.UPDATE(reviewId, replyId),
      data
    ),

  /**
   * 운영자 답글 삭제
   */
  deleteReply: (reviewId: number, replyId: number) =>
    del<void>(API_ENDPOINTS.REVIEWS.REPLY.DELETE(reviewId, replyId)),
};
