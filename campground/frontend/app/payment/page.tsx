/**
 * 결제 페이지
 * 토스 페이먼츠 위젯을 사용한 결제 처리
 *
 * @see docs/sprints/sprint-2.md
 * @see docs/specifications/06-SCREEN-LAYOUTS.md - 💳 결제
 *
 * Layout Specifications:
 * - Header: 56px
 * - Order Summary: 180px
 * - Price Breakdown: 120px
 * - Toss Payments Widget: 400px
 * - Agreement: 60px
 * - Sticky Pay Button: 72px
 */

"use client";

import { PriceBreakdownDisplay } from "@/components/features/PriceBreakdownDisplay";
import { PriceBreakdown } from "@/components/features/reservation";
import { PageHeader } from "@/components/layout/PageHeader";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/ui/useToast";
import { useReservationDetail } from "@/hooks/useReservationDetail";
import { ApiError } from "@/lib/api/errors";
import { ROUTES } from "@/lib/constants";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

// 토스 페이먼츠 위젯을 동적 임포트
const TossPaymentWidget = dynamic(
  () =>
    import("@/components/features/payment").then(
      (mod) => mod.TossPaymentWidget
    ),
  {
    loading: () => (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner />
      </div>
    ),
    ssr: false, // 결제 위젯은 클라이언트에서만 작동
  }
);

function PaymentContent() {
  const router = useRouter();
  const toast = useToast();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [isWidgetReady, setIsWidgetReady] = useState(false);
  const [orderId] = useState(() => `ORDER_${Date.now()}`);

  // customerKey 생성 (영문, 숫자, 특수문자만 허용)
  // 사용자 ID를 기반으로 안전한 customerKey 생성
  const [customerKey] = useState(() =>
    user?.id ? `USER_${user.id}` : `GUEST_${Date.now()}`
  );

  // ✅ URL 파라미터에서 필수 ID만 가져오기
  const reservationId = searchParams.get("reservationId");
  const paymentId = searchParams.get("paymentId");

  // ✅ API로 예약 상세 정보 조회 (priceBreakdown 포함)
  const {
    data: reservation,
    isLoading,
    error,
  } = useReservationDetail(reservationId ? Number(reservationId) : 0);

  console.log("🔍 [DEBUG] Payment page data:", {
    reservationId,
    paymentId,
    reservation,
    isLoading,
    error,
  });

  // ✅ API 응답에서 모든 정보 추출
  const campgroundName = reservation?.campgroundName;
  const siteNumber = reservation?.siteNumber;
  const checkInDate = reservation?.checkInDate;
  const checkOutDate = reservation?.checkOutDate;
  const nights = reservation?.numberOfNights || 0;
  const adults = reservation?.numberOfGuests || 0;
  const totalAmount = reservation?.totalAmount || 0;
  const basePrice = reservation?.siteBasePrice || 0;
  const priceBreakdown = reservation?.priceBreakdown;

  // children은 numberOfGuests에 포함되어 있으므로 별도 표시 안 함
  const children = 0;

  // ✅ 로딩 중일 때
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // ✅ 에러 발생 시
  if (error) {
    console.error("❌ Failed to load reservation:", error);

    // ✅ 에러 타입별 메시지
    let errorMessage = "예약 정보를 불러올 수 없습니다.";
    let showRetry = false;

    if (error instanceof ApiError) {
      if (error.status === 404) {
        errorMessage = "예약을 찾을 수 없습니다.";
      } else if (error.status === 403) {
        errorMessage = "예약 정보에 접근할 권한이 없습니다.";
      } else if (error.isServerError()) {
        errorMessage = "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
        showRetry = true;
      }
    } else {
      errorMessage = "예약 정보를 불러오는 중 오류가 발생했습니다.";
      showRetry = true;
    }

    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="space-y-4 text-center">
          <p className="text-neutral-600">{errorMessage}</p>
          <div className="space-x-2">
            {showRetry && (
              <button
                onClick={() => window.location.reload()}
                className="bg-primary hover:bg-primary/90 rounded-lg px-4 py-2 text-white"
              >
                다시 시도
              </button>
            )}
            <button
              onClick={() => router.push(ROUTES.CAMPGROUNDS.LIST)}
              className="text-primary hover:underline"
            >
              캠핑장 목록으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ✅ 데이터 검증 - API 응답 기반
  if (
    !reservation ||
    !reservationId ||
    !campgroundName ||
    !siteNumber ||
    !checkInDate ||
    !checkOutDate ||
    !totalAmount
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-neutral-600">
            결제 정보를 불러올 수 없습니다.
          </p>
          <button
            onClick={() => router.push(ROUTES.CAMPGROUNDS.LIST)}
            className="text-primary hover:underline"
          >
            캠핑장 목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // 주문 이름
  const orderName = `${campgroundName} ${nights}박`;

  const handleWidgetError = (error: Error) => {
    console.error("결제 위젯 에러:", error);
    toast.error("결제 위젯을 불러오는데 실패했습니다. 다시 시도해주세요");
    router.back();
  };

  return (
    <div className="min-h-screen bg-neutral-50 pb-14">
      {/* Header: 56px */}
      <PageHeader title="결제하기" showBack />

      <main className="space-y-6 px-4 py-6">
        {/* Order Summary: 180px */}
        <section className="space-y-3 rounded-lg bg-white p-6">
          <h2 className="text-lg font-semibold text-neutral-900">주문 정보</h2>

          <div className="space-y-2 text-sm">
            <div>
              <p className="font-medium text-neutral-900">{campgroundName}</p>
              <p className="text-neutral-600">{siteNumber} 사이트</p>
            </div>

            <div className="text-neutral-600">
              <p>
                {format(new Date(checkInDate), "M/d(E)", {
                  locale: ko,
                })}{" "}
                -{" "}
                {format(new Date(checkOutDate), "M/d(E)", {
                  locale: ko,
                })}
                , {nights}박
              </p>
              <p>
                성인 {adults}명{children > 0 && `, 어린이 ${children}명`}
              </p>
            </div>
          </div>
        </section>

        {/* Price Breakdown: 120px */}
        <section className="rounded-lg bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-neutral-900">
            결제 금액
          </h2>
          {priceBreakdown &&
          priceBreakdown.dailyBreakdown &&
          priceBreakdown.dailyBreakdown.length > 0 ? (
            <PriceBreakdownDisplay
              breakdown={priceBreakdown}
              showTitle={false}
            />
          ) : (
            <PriceBreakdown
              basePrice={basePrice}
              nights={nights}
              discount={0}
            />
          )}
        </section>

        {/* Toss Payments Widget: 400px */}
        <section className="rounded-lg bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-neutral-900">
            결제 수단
          </h2>

          <TossPaymentWidget
            orderId={orderId}
            orderName={orderName}
            customerKey={customerKey}
            customerName={user?.name || "고객"}
            customerEmail={user?.email}
            amount={totalAmount}
            paymentId={paymentId || undefined}
            onReady={() => setIsWidgetReady(true)}
            onError={handleWidgetError}
          />
        </section>

        {/* Agreement: 60px */}
        <section className="rounded-lg bg-white p-4">
          <p className="text-xs text-neutral-500">
            결제하기 버튼을 누르면 결제 조건 및 개인정보 처리 방침에 동의하는
            것으로 간주됩니다.
          </p>
        </section>
      </main>

      {/* Widget이 로드되었음을 사용자에게 표시 */}
      {!isWidgetReady && (
        <div className="fixed inset-0 flex items-center justify-center bg-white/80">
          <p className="text-sm text-neutral-600">결제 준비 중...</p>
        </div>
      )}
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-50" />}>
      <PaymentContent />
    </Suspense>
  );
}
