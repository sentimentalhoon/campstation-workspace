/**
 * API 응답 타입
 */

import type {
  Campground,
  Payment,
  Reservation,
  Review,
  Site,
  User,
} from "../domain";
import type { ApiResponse, PageResponse } from "./common";

/**
 * 인증 응답
 */
// JWT 토큰 응답 (API 클라이언트가 unwrap한 후의 실제 타입)
export type JwtResponse = {
  accessToken: string;
  tokenType?: string;
  expiresIn: number;
  expiresAt: number; // Unix timestamp (밀리초)
  userId: number;
  email: string;
  name: string;
  role: string;
  profileImage?: string;
};

// 레거시 타입 (호환성 유지)
export type LoginResponse = ApiResponse<JwtResponse>;
export type RegisterResponse = ApiResponse<JwtResponse>;

export type MeResponse = ApiResponse<User>;

/**
 * 캠핑장 응답
 */
export type CampgroundListResponse = ApiResponse<PageResponse<Campground>>;
export type CampgroundDetailResponse = ApiResponse<Campground>;
export type CampgroundSitesResponse = ApiResponse<PageResponse<Site>>;

/**
 * 예약 응답
 */
export type ReservationListResponse = ApiResponse<PageResponse<Reservation>>;
export type ReservationDetailResponse = ApiResponse<Reservation>;
export type CreateReservationResponse = ApiResponse<Reservation>;

/**
 * 리뷰 응답
 */
export type ReviewListResponse = ApiResponse<PageResponse<Review>>;
export type ReviewDetailResponse = ApiResponse<Review>;
export type CreateReviewResponse = ApiResponse<Review>;
export type UpdateReviewResponse = ApiResponse<Review>;

/**
 * 결제 응답
 */
export type CreatePaymentResponse = ApiResponse<Payment>;
export type VerifyPaymentResponse = ApiResponse<Payment>;
export type ConfirmPaymentResponse = ApiResponse<Payment>;
