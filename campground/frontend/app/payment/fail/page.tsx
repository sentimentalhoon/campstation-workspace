/**
 * 결제 실패 페이지
 * 토스 페이먼츠 결제 실패 시 리다이렉트되는 페이지
 *
 * @see docs/sprints/sprint-2.md
 * @see https://docs.tosspayments.com/guides/payment-widget/integration#결제-실패
 */

"use client";

import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ROUTES } from "@/lib/constants";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function PaymentFailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 토스 페이먼츠 실패 파라미터
  const code = searchParams.get("code");
  const message = searchParams.get("message");

  const getErrorMessage = () => {
    // 토스 페이먼츠 에러 코드별 메시지 매핑
    switch (code) {
      case "PAY_PROCESS_CANCELED":
        return "사용자가 결제를 취소했습니다.";
      case "PAY_PROCESS_ABORTED":
        return "결제 승인이 중단되었습니다.";
      case "REJECT_CARD_COMPANY":
        return "카드사에서 승인을 거부했습니다.";
      case "EXCEED_MAX_CARD_MONEY":
        return "카드 한도를 초과했습니다.";
      case "INVALID_CARD_EXPIRATION":
        return "카드 유효기간이 만료되었습니다.";
      case "INVALID_STOPPED_CARD":
        return "정지된 카드입니다.";
      case "NOT_AVAILABLE_PAYMENT":
        return "사용할 수 없는 결제 수단입니다.";
      default:
        return message || "결제에 실패했습니다.";
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-md space-y-6 rounded-lg bg-white p-8 text-center">
        {/* Error Icon */}
        <div className="text-6xl">❌</div>

        {/* Error Message */}
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-neutral-900">결제 실패</h1>
          <p className="text-neutral-600">{getErrorMessage()}</p>
          {code && (
            <p className="text-xs text-neutral-400">오류 코드: {code}</p>
          )}
        </div>

        {/* Help Text */}
        <div className="space-y-2 rounded-lg bg-neutral-50 p-4 text-left text-sm">
          <p className="font-medium text-neutral-900">다음을 확인해주세요</p>
          <ul className="list-inside list-disc space-y-1 text-neutral-600">
            <li>카드 유효기간 및 한도</li>
            <li>입력 정보의 정확성</li>
            <li>인터넷 연결 상태</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button variant="primary" fullWidth onClick={() => router.back()}>
            다시 시도하기
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

export default function PaymentFailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-neutral-50">
          <LoadingSpinner size="lg" />
        </div>
      }
    >
      <PaymentFailContent />
    </Suspense>
  );
}
