/**
 * API 요청 타입
 */

import type {
  ChangePasswordData,
  CreateCampgroundDto,
  CreatePaymentDto,
  CreateReservationDto,
  CreateReviewDto,
  LoginCredentials,
  PaymentVerificationDto,
  ConfirmPaymentDto,
  RegisterData,
  UpdateCampgroundDto,
  UpdateProfileData,
  UpdateReviewDto,
} from "../domain";

/**
 * 인증 요청
 */
export type LoginRequest = LoginCredentials;
export type RegisterRequest = RegisterData;

/**
 * 사용자 요청
 */
export type UpdateProfileRequest = UpdateProfileData;
export type ChangePasswordRequest = ChangePasswordData;

/**
 * 캠핑장 요청
 */
export type CreateCampgroundRequest = CreateCampgroundDto;
export type UpdateCampgroundRequest = UpdateCampgroundDto;

/**
 * 예약 요청
 */
export type CreateReservationRequest = CreateReservationDto;

/**
 * 리뷰 요청
 */
export type CreateReviewRequest = CreateReviewDto;
export type UpdateReviewRequest = UpdateReviewDto;

/**
 * 결제 요청
 */
export type CreatePaymentRequest = CreatePaymentDto;
export type VerifyPaymentRequest = PaymentVerificationDto;
export type ConfirmPaymentRequest = ConfirmPaymentDto;
