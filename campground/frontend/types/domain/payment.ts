/**
 * 결제 도메인 타입
 */

export type PaymentMethod = "CARD" | "EASY_PAYMENT" | "BANK_TRANSFER";

export type PaymentStatus =
  | "PENDING"
  | "COMPLETED"
  | "FAILED"
  | "REFUNDED"
  | "CONFIRMATION_REQUESTED";

export type Payment = {
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

export type CreatePaymentDto = {
  reservationId: number;
  amount: number;
  method: PaymentMethod;
  depositorName?: string;
};

export type PaymentVerificationDto = {
  paymentId: number;
  impUid: string;
  merchantUid: string;
};

export type ConfirmPaymentDto = {
  paymentKey: string;
  orderId: string;
  amount: number;
};
