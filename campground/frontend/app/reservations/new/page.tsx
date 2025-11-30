/**
 * New Reservation Page (Refactored)
 * 3-step reservation flow with modular architecture
 * React 19+ with useTransition and memo optimization
 */

"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import StepIndicator from "@/components/ui/StepIndicator";
import { useCampgroundDetail } from "@/hooks/useCampgroundDetail";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import {
  ReservationSummaryBar,
  Step1DateSelection,
  Step2SiteSelection,
  Step3GuestInfo,
} from "./components";
import { useReservationFlow } from "./hooks";

function ReservationContent() {
  const searchParams = useSearchParams();
  const campgroundId = searchParams.get("campgroundId");

  // URL parameters for pre-selection
  const urlSiteId = searchParams.get("siteId");
  const urlCheckIn = searchParams.get("checkIn");
  const urlCheckOut = searchParams.get("checkOut");

  // Fetch campground data
  const {
    data: campground,
    isLoading,
    error,
  } = useCampgroundDetail(campgroundId ? Number(campgroundId) : 0);

  // Reservation flow management
  const reservationFlow = useReservationFlow({
    campgroundId: campgroundId ? Number(campgroundId) : 0,
    urlSiteId,
    urlCheckIn,
    urlCheckOut,
  });

  // Error states
  if (!campgroundId) {
    return (
      <ErrorMessage message="캠핑장 정보를 찾을 수 없습니다. URL을 확인해주세요." />
    );
  }

  if (isLoading) {
    return <LoadingSpinner size="lg" />;
  }

  if (error || !campground) {
    return (
      <ErrorMessage
        message={
          error instanceof Error
            ? error.message
            : "캠핑장 정보를 불러오는데 실패했습니다."
        }
      />
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 pb-25">
      <PageHeader
        title="예약하기"
        showBack
        onBack={reservationFlow.handleBack}
      />

      <div className="max-w-640px mx-auto px-4 pt-14 pb-14">
        {/* Step Indicator */}
        <div className="mb-4 rounded-lg bg-white p-4">
          <StepIndicator
            steps={[
              { label: "날짜 선택", description: "체크인/아웃" },
              { label: "사이트 선택", description: "원하는 사이트" },
              { label: "정보 입력", description: "인원 수" },
            ]}
            currentStep={reservationFlow.step}
          />
        </div>

        {/* Campground Info */}
        <div className="mb-4 rounded-lg bg-white p-4">
          <h2 className="mb-1 text-lg font-bold">{campground.name}</h2>
          <p className="text-sm text-neutral-600">{campground.address}</p>
        </div>

        {/* Step 1: Date Selection */}
        {reservationFlow.step === 1 && (
          <Step1DateSelection
            dateRange={reservationFlow.dateRange}
            nights={reservationFlow.nights}
            onSelectRange={reservationFlow.updateDateRange}
          />
        )}

        {/* Step 2: Site Selection */}
        {reservationFlow.step === 2 && (
          <Step2SiteSelection
            sites={reservationFlow.sites}
            selectedSiteId={reservationFlow.selectedSiteId}
            loadingSites={reservationFlow.loadingSites}
            onSelect={reservationFlow.updateSelectedSite}
          />
        )}

        {/* Step 3: Guest Info */}
        {reservationFlow.step === 3 &&
          (() => {
            console.log("🔍 [DEBUG] Rendering Step 3 with priceBreakdown:", {
              priceBreakdown: reservationFlow.priceBreakdown,
              hasBreakdown: !!reservationFlow.priceBreakdown,
              hasDailyBreakdown:
                reservationFlow.priceBreakdown?.dailyBreakdown?.length,
              hasDiscounts:
                reservationFlow.priceBreakdown?.appliedDiscounts?.length,
              totalAmount: reservationFlow.priceBreakdown?.totalAmount,
            });
            return (
              <Step3GuestInfo
                dateRange={reservationFlow.dateRange}
                nights={reservationFlow.nights}
                selectedSite={reservationFlow.selectedSite}
                adults={reservationFlow.adults}
                children={reservationFlow.children}
                paymentMethod={reservationFlow.paymentMethod}
                depositorName={reservationFlow.depositorName}
                priceBreakdown={reservationFlow.priceBreakdown}
                onChangeAdults={reservationFlow.updateAdults}
                onChangeChildren={reservationFlow.updateChildren}
                onChangePaymentMethod={reservationFlow.updatePaymentMethod}
                onChangeDepositorName={reservationFlow.updateDepositorName}
                onBackToStep1={() => reservationFlow.handleBack()}
              />
            );
          })()}
      </div>

      {/* Sticky Summary Bar */}
      <ReservationSummaryBar
        step={reservationFlow.step}
        nights={reservationFlow.nights}
        selectedSite={reservationFlow.selectedSite}
        totalPrice={reservationFlow.totalPrice}
        canGoNext={reservationFlow.canGoNext || false}
        isCreatingReservation={reservationFlow.isCreatingReservation}
        onNext={reservationFlow.handleNext}
      />
    </div>
  );
}

export default function ReservationPage() {
  return (
    <Suspense fallback={<LoadingSpinner size="lg" />}>
      <ReservationContent />
    </Suspense>
  );
}
