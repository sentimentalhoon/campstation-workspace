/**
 * 예약 도메인 타입
 */

import type { PaymentMethod, PaymentStatus } from "./payment";
import type { PriceBreakdown } from "./pricing";

export type ReservationStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED";

export type Reservation = {
  id: number;
  userId: number;
  userName: string;
  campgroundId: number;
  campgroundName: string;
  siteId: number;
  siteNumber: string;
  siteBasePrice?: number; // 사이트 기본 가격
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  numberOfNights: number;
  totalAmount: number;
  status: ReservationStatus;
  specialRequests?: string | null;
  priceBreakdown?: PriceBreakdown; // 가격 상세 내역
  payment?: {
    id: number;
    reservationId: number;
    amount: number;
    paymentMethod: PaymentMethod;
    status: PaymentStatus;
    transactionId?: string | null;
    cardNumber?: string | null;
    cardHolderName?: string | null;
    depositorName?: string | null;
    campgroundName?: string | null;
    tossMethod?: string | null;
    easyPayProvider?: string | null;
    cardCompany?: string | null;
    cardType?: string | null;
    acquirerCode?: string | null;
    installmentPlanMonths?: number | null;
    approveNo?: string | null;
    approvedAt?: string | null;
    createdAt: string;
    updatedAt: string;
  };
  createdAt: string;
  updatedAt: string;
};

export type CreateReservationDto = {
  campgroundId: number;
  siteId: number;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  specialRequests?: string;
  paymentMethod: PaymentMethod;
  depositorName?: string;
  expectedAmount?: number; // 프론트엔드에서 계산한 예상 금액 (검증용)
};

export type UpdateReservationDto = {
  checkInDate?: string;
  checkOutDate?: string;
  numberOfGuests?: number;
  specialRequests?: string;
};

export type GuestReservationDto = CreateReservationDto & {
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  guestPassword: string;
};

export type GuestReservationLookupDto = {
  guestPhone: string;
  guestEmail: string;
  guestPassword: string;
};

export type ReservationSearchParams = {
  status?: ReservationStatus;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
};
