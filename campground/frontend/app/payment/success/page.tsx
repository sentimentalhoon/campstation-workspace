/**
 * 결제 성공 페이지
 * 토스 페이먼츠 결제 성공 후 리다이렉트되는 페이지
 *
 * @see docs/sprints/sprint-2.md
 * @see https://docs.tosspayments.com/reference#결제-승인
 */

"use client";

import { PriceBreakdownDisplay } from "@/components/features/PriceBreakdownDisplay";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useReservationDetail } from "@/hooks/useReservationDetail";
import { paymentApi } from "@/lib/api/payments";
import { ROUTES } from "@/lib/constants";
import type { Payment } from "@/types/domain";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

type PaymentResult = {
  orderId: string;
  amount: number;
  orderName: string;
  reservationId: number;
  method?: string;
  approvedAt?: string;
};

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PaymentResult | null>(null);

  // 예약 상세 정보 조회 (priceBreakdown 포함)
  const { data: reservation } = useReservationDetail(
    result?.reservationId || 0
  );

  // 토스 페이먼츠 API 개별 연동 콜백 파라미터
  const paymentKey = searchParams.get("paymentKey");
  const orderId = searchParams.get("orderId");
  const amount = searchParams.get("amount");

  useEffect(() => {
    const verifyPayment = async () => {
      if (!paymentKey || !orderId || !amount) {
        setError("잘못된 결제 정보입니다.");
        setIsVerifying(false);
        return;
      }

      try {
        // URL에서 paymentId 추출 (예약 생성 시 받은 값)
        const urlPaymentId = searchParams.get("paymentId");
        const paymentIdToConfirm = urlPaymentId ? Number(urlPaymentId) : 1; // 임시값

        console.log("🔍 [DEBUG] 결제 승인 요청:", {
          paymentId: paymentIdToConfirm,
          paymentKey,
          orderId,
          amount: Number(amount),
        });

        // ✅ 백엔드 결제 승인 API 호출 (금액 재검증 포함)
        // API 클라이언트가 CommonResponse의 data 필드를 unwrap하므로 Payment 타입으로 반환됨
        const payment = (await paymentApi.confirm(paymentIdToConfirm, {
          paymentKey,
          orderId,
          amount: Number(amount),
        })) as unknown as Payment;

        console.log("✅ 결제 승인 성공:", payment);

        // ✅ 프론트엔드에서도 금액 검증 (이중 체크)
        if (payment.amount && Math.abs(payment.amount - Number(amount)) > 0) {
          console.warn("⚠️ 결제 금액 불일치 감지!", {
            savedAmount: payment.amount,
            requestedAmount: Number(amount),
            difference: Math.abs(payment.amount - Number(amount)),
          });
        }

        setResult({
          orderId,
          amount: Number(amount),
          orderName: payment.reservationId
            ? `예약 #${payment.reservationId}`
            : "캠핑장 예약",
          reservationId: payment.reservationId || 0,
          method: payment.paymentMethod,
          approvedAt: payment.approvedAt ?? undefined,
        });
      } catch (err) {
        console.error("❌ 결제 승인 실패:", err);

        // ✅ 에러 메시지 상세화
        let errorMessage = "결제 승인에 실패했습니다.";

        if (err instanceof Error) {
          // 금액 불일치 에러 특별 처리
          if (err.message.includes("금액") || err.message.includes("amount")) {
            errorMessage =
              "결제 금액이 일치하지 않습니다. 고객센터로 문의해주세요.";
          } else if (err.message.includes("찾을 수 없")) {
            errorMessage = "결제 정보를 찾을 수 없습니다.";
          } else {
            errorMessage = err.message;
          }
        }

        setError(errorMessage);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [paymentKey, orderId, amount, searchParams]);

  if (isVerifying) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <div className="space-y-4 text-center">
          <LoadingSpinner size="lg" />
          <p className="text-neutral-600">결제를 확인하고 있습니다...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
        <div className="w-full max-w-md space-y-6 rounded-lg bg-white p-8 text-center">
          <div className="text-6xl">❌</div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-neutral-900">
              결제 확인 실패
            </h1>
            <p className="text-neutral-600">{error}</p>
          </div>
          <div className="space-y-3">
            <Button
              variant="primary"
              fullWidth
              onClick={() => router.push(ROUTES.RESERVATIONS.LIST)}
            >
              예약 내역으로
            </Button>
            <Button
              variant="ghost"
              fullWidth
              onClick={() => router.push(ROUTES.CAMPGROUNDS.LIST)}
            >
              캠핑장 둘러보기
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-md space-y-6 rounded-lg bg-white p-8 text-center">
        {/* Success Icon */}
        <div className="text-6xl">✅</div>

        {/* Success Message */}
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-neutral-900">
            결제가 완료되었습니다
          </h1>
          <p className="text-neutral-600">예약이 확정되었습니다</p>
        </div>

        {/* Payment Info */}
        {result && (
          <div className="space-y-4">
            <div className="space-y-2 rounded-lg bg-neutral-50 p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-600">주문번호</span>
                <span className="font-medium">{result.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">상품명</span>
                <span className="font-medium">{result.orderName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">결제금액</span>
                <span className="text-primary font-semibold">
                  ₩{result.amount.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Price Breakdown */}
            {reservation?.priceBreakdown && (
              <PriceBreakdownDisplay
                breakdown={reservation.priceBreakdown}
                showTitle={true}
                className="text-left"
              />
            )}
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <Button
            variant="primary"
            fullWidth
            onClick={() =>
              router.push(
                ROUTES.RESERVATIONS.DETAIL(Number(result?.reservationId))
              )
            }
          >
            예약 상세 보기
          </Button>
          <Button
            variant="ghost"
            fullWidth
            onClick={() => router.push(ROUTES.RESERVATIONS.LIST)}
          >
            예약 내역으로
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-neutral-50">
          <LoadingSpinner size="lg" />
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
