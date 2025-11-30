/**
 * 결제 API
 */

import { API_ENDPOINTS } from "@/lib/constants";
import type {
  ConfirmPaymentRequest,
  ConfirmPaymentResponse,
  CreatePaymentRequest,
  CreatePaymentResponse,
  VerifyPaymentRequest,
  VerifyPaymentResponse,
} from "@/types";
import { post } from "./client";

export const paymentApi = {
  /**
   * 결제 생성
   */
  create: (data: CreatePaymentRequest) =>
    post<CreatePaymentResponse>(API_ENDPOINTS.PAYMENTS.PROCESS, data),

  /**
   * 결제 검증
   */
  verify: (id: string, data: VerifyPaymentRequest) =>
    post<VerifyPaymentResponse>(API_ENDPOINTS.PAYMENTS.VERIFY(id), data),

  /**
   * 결제 승인 (Toss Payments)
   */
  confirm: (
    paymentId: number,
    data: ConfirmPaymentRequest
  ): Promise<ConfirmPaymentResponse> => {
    const { paymentKey, orderId, amount } = data;
    const url = `${API_ENDPOINTS.PAYMENTS.CONFIRM(paymentId)}?paymentKey=${paymentKey}&orderId=${orderId}&amount=${amount}`;
    return post<ConfirmPaymentResponse>(url, {});
  },

  /**
   * 입금 확인 요청 (계좌이체)
   */
  requestDepositConfirmation: (paymentId: number) =>
    post<string>(`/v1/payments/${paymentId}/request-confirmation`, {}),

  /**
   * 입금 확인 (Owner/Admin - 계좌이체 결제 승인)
   */
  confirmDeposit: (paymentId: number) =>
    post<{ data: import("@/types").Payment }>(
      `/v1/payments/${paymentId}/confirm-deposit`,
      {}
    ),
};
