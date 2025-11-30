"use client";

import { useEffect, useState } from "react";
import BankTransferPayment from "./BankTransferPayment";

interface TossPaymentWidgetProps {
  orderId: string;
  orderName: string;
  customerKey: string; // 고객 식별 키 (영문, 숫자, 특수문자만)
  customerName: string;
  customerEmail?: string;
  amount: number;
  paymentId?: string; // 결제 ID (예약 생성 시 받은 값)
  onReady?: () => void;
  onError?: (error: Error) => void;
}

type PaymentMethod =
  | "CARD"
  | "TRANSFER"
  | "DIRECT_TRANSFER"
  | "VIRTUAL_ACCOUNT";

export default function TossPaymentWidget({
  orderId,
  orderName,
  customerName,
  customerEmail,
  amount,
  paymentId,
  onReady,
  onError,
}: TossPaymentWidgetProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("CARD");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showBankTransfer, setShowBankTransfer] = useState(false);

  // 컴포넌트가 마운트되면 준비 완료 콜백 호출
  useEffect(() => {
    onReady?.();
  }, [onReady]);

  const handlePayment = async () => {
    // 직접 계좌이체 선택 시
    if (selectedMethod === "DIRECT_TRANSFER") {
      setShowBankTransfer(true);
      return;
    }

    const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY as string;

    if (!clientKey) {
      alert("결제 설정이 올바르지 않습니다.");
      return;
    }

    if (isProcessing) return;
    setIsProcessing(true);

    try {
      // 결제 성공/실패 URL 설정
      const successUrl = paymentId
        ? `${window.location.origin}/payment/success?paymentId=${paymentId}`
        : `${window.location.origin}/payment/success`;
      const failUrl = `${window.location.origin}/payment/fail`;

      // 동적으로 Payment SDK 로드
      const { loadTossPayments } = await import("@tosspayments/payment-sdk");

      const tossPayments = await loadTossPayments(clientKey);

      // 결제 수단별 처리
      let method: "카드" | "계좌이체" | "가상계좌" = "카드";
      if (selectedMethod === "CARD") {
        method = "카드";
      } else if (selectedMethod === "TRANSFER") {
        method = "계좌이체";
      } else if (selectedMethod === "VIRTUAL_ACCOUNT") {
        method = "가상계좌";
      }

      // 결제창 호출
      await tossPayments.requestPayment(method, {
        amount,
        orderId,
        orderName,
        customerName,
        customerEmail,
        successUrl,
        failUrl,
      });
    } catch (error) {
      console.error("결제 요청 실패:", error);
      setIsProcessing(false);
      onError?.(error as Error);

      // 사용자가 취소한 경우는 알림 표시하지 않음
      if (error instanceof Error && !error.message.includes("USER_CANCEL")) {
        alert("결제 요청 중 오류가 발생했습니다.");
      }
    }
  };

  // 직접 계좌이체 화면 표시
  if (showBankTransfer) {
    return (
      <BankTransferPayment
        orderId={orderId}
        orderName={orderName}
        amount={amount}
        customerName={customerName}
        reservationId={paymentId ? Number(paymentId) : undefined}
        onCancel={() => setShowBankTransfer(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* 결제 금액 표시 */}
      <div className="rounded-lg bg-gray-50 p-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">결제 금액</span>
          <span className="text-2xl font-bold text-gray-900">
            {amount.toLocaleString()}원
          </span>
        </div>
      </div>

      {/* 결제 수단 선택 */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900">결제 수단</h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setSelectedMethod("CARD")}
            className={`rounded-lg border-2 p-4 text-center transition-all ${
              selectedMethod === "CARD"
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
            }`}
          >
            <div className="mb-1 text-2xl">💳</div>
            <div className="font-medium">카드/간편결제</div>
            <div className="mt-1 text-xs text-gray-500">토스/카카오/네이버</div>
          </button>

          <button
            onClick={() => setSelectedMethod("TRANSFER")}
            className={`rounded-lg border-2 p-4 text-center transition-all ${
              selectedMethod === "TRANSFER"
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
            }`}
          >
            <div className="mb-1 text-2xl">🏦</div>
            <div className="font-medium">계좌이체</div>
            <div className="mt-1 text-xs text-gray-500">토스 결제창</div>
          </button>

          <button
            onClick={() => setSelectedMethod("DIRECT_TRANSFER")}
            className={`rounded-lg border-2 p-4 text-center transition-all ${
              selectedMethod === "DIRECT_TRANSFER"
                ? "border-green-500 bg-green-50 text-green-700"
                : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
            }`}
          >
            <div className="mb-1 text-2xl">🏦</div>
            <div className="font-medium">직접 계좌이체</div>
            <div className="mt-1 text-xs font-semibold text-green-600">
              수수료 무료
            </div>
          </button>

          <button
            onClick={() => setSelectedMethod("VIRTUAL_ACCOUNT")}
            className={`rounded-lg border-2 p-4 text-center transition-all ${
              selectedMethod === "VIRTUAL_ACCOUNT"
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
            }`}
          >
            <div className="mb-1 text-2xl">🏧</div>
            <div className="font-medium">가상계좌</div>
          </button>
        </div>
      </div>

      {/* 직접 계좌이체 안내 */}
      {selectedMethod === "DIRECT_TRANSFER" && (
        <div className="rounded-lg border-2 border-green-500 bg-green-50 p-4 text-sm">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-lg">💰</span>
            <h4 className="font-semibold text-green-900">
              수수료 없이 결제하세요!
            </h4>
          </div>
          <ul className="space-y-1 text-green-800">
            <li>• 우리 계좌로 직접 입금하여 수수료를 절약하세요</li>
            <li>• 입금 확인 후 예약이 자동으로 확정됩니다</li>
            <li>• 입금 기한: 24시간 이내</li>
          </ul>
        </div>
      )}

      {/* 카드/간편결제 안내 */}
      {selectedMethod === "CARD" && (
        <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-700">
          <p className="mb-1 font-medium">💡 결제 수단</p>
          <ul className="space-y-1 text-blue-600">
            <li>• 신용카드 / 체크카드</li>
            <li>• 간편결제: 토스페이, 카카오페이, 네이버페이, 페이코</li>
          </ul>
        </div>
      )}

      {/* 결제하기 버튼 */}
      <button
        onClick={handlePayment}
        disabled={isProcessing}
        className={`w-full rounded-lg py-4 font-bold text-white transition-colors ${
          isProcessing
            ? "cursor-not-allowed bg-gray-400"
            : selectedMethod === "DIRECT_TRANSFER"
              ? "bg-green-600 hover:bg-green-700"
              : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {isProcessing
          ? "처리 중..."
          : selectedMethod === "DIRECT_TRANSFER"
            ? "계좌 정보 확인하기"
            : `${amount.toLocaleString()}원 결제하기`}
      </button>

      {/* 주의사항 */}
      <div className="text-xs text-gray-500">
        {selectedMethod === "DIRECT_TRANSFER" ? (
          <>
            <p>• 입금 기한 내에 입금하지 않으면 예약이 자동 취소됩니다.</p>
            <p>• 예약자명과 입금자명이 같아야 빠른 확인이 가능합니다.</p>
          </>
        ) : (
          <>
            <p>• 결제 진행 시 토스페이먼츠 결제창으로 이동합니다.</p>
            <p>• 안전한 결제를 위해 본인인증이 필요할 수 있습니다.</p>
          </>
        )}
      </div>
    </div>
  );
}
