/**
 * Step3GuestInfo Component
 * Booking summary, guest counter, special requests, and payment method selection
 * React 19+ with React Compiler auto-optimization
 */

import GuestCounter from "@/components/features/GuestCounter";
import { PriceBreakdownDisplay } from "@/components/features/PriceBreakdownDisplay";
import {
  Alert,
  AlertDescription,
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui";
import { Textarea } from "@/components/ui/Textarea";
import type { PaymentMethod } from "@/types";
import type { Site } from "@/types/domain/campground";
import type { PriceBreakdown } from "@/types/domain/pricing";
import { useEffect } from "react";

interface Step3GuestInfoProps {
  dateRange: { start: Date; end: Date } | undefined;
  nights: number;
  selectedSite: Site | undefined;
  adults: number;
  children: number;
  paymentMethod: PaymentMethod;
  depositorName: string;
  priceBreakdown?: PriceBreakdown; // 가격 상세 내역
  onChangeAdults: (count: number) => void;
  onChangeChildren: (count: number) => void;
  onChangePaymentMethod: (method: PaymentMethod) => void;
  onChangeDepositorName: (name: string) => void;
  onBackToStep1: () => void;
}

export function Step3GuestInfo({
  dateRange,
  nights,
  selectedSite,
  adults,
  children: childrenCount,
  paymentMethod,
  depositorName,
  priceBreakdown,
  onChangeAdults,
  onChangeChildren,
  onChangePaymentMethod,
  onChangeDepositorName,
  onBackToStep1,
}: Step3GuestInfoProps) {
  // Debug: Log priceBreakdown when component receives it
  useEffect(() => {
    console.log("🔍 [DEBUG] Step3GuestInfo received priceBreakdown:", {
      priceBreakdown,
      hasBreakdown: !!priceBreakdown,
      hasDailyBreakdown: priceBreakdown?.dailyBreakdown?.length,
      hasDiscounts: priceBreakdown?.appliedDiscounts?.length,
      totalAmount: priceBreakdown?.totalAmount,
      dailyBreakdown: priceBreakdown?.dailyBreakdown,
      appliedDiscounts: priceBreakdown?.appliedDiscounts,
    });

    // 🔍 첫 번째 dailyBreakdown 항목 자세히 출력
    if (
      priceBreakdown?.dailyBreakdown &&
      priceBreakdown.dailyBreakdown.length > 0
    ) {
      const firstItem = priceBreakdown.dailyBreakdown[0];
      console.log("🔍 [DEBUG] First dailyBreakdown item (corrected fields):", {
        rawItem: firstItem,
        date: firstItem?.date,
        dailyRate: firstItem?.dailyRate,
        pricingName: firstItem?.pricingName,
        weekend: firstItem?.weekend,
      });
    }
  }, [priceBreakdown]);

  return (
    <div className="space-y-4">
      {/* Booking Summary */}
      <div className="rounded-lg bg-white p-4">
        <h3 className="mb-3 text-base font-bold">예약 정보</h3>
        <div className="space-y-2">
          {dateRange && (
            <div className="rounded-lg bg-neutral-50 p-3">
              <div className="mb-1 text-xs font-medium text-neutral-500">
                날짜
              </div>
              <div className="text-sm">
                {dateRange.start.toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}{" "}
                ~{" "}
                {dateRange.end.toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
              <div className="text-primary mt-1 text-sm font-bold">
                {nights}박
              </div>
            </div>
          )}
          {selectedSite && (
            <div className="rounded-lg bg-neutral-50 p-3">
              <div className="mb-1 text-xs font-medium text-neutral-500">
                사이트
              </div>
              <div className="text-sm font-medium">
                {selectedSite.siteNumber} ({selectedSite.siteType})
              </div>
              <div className="mt-1 text-sm text-neutral-600">
                ₩{selectedSite.basePrice.toLocaleString()} / 박
              </div>
            </div>
          )}
          {(!dateRange || !selectedSite) && (
            <Alert variant="warning">
              <AlertDescription>
                ⚠️ 날짜 또는 사이트가 선택되지 않았습니다.
                <button
                  onClick={onBackToStep1}
                  className="text-primary ml-2 font-medium underline"
                >
                  1단계로 돌아가기
                </button>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>

      {/* Guest Counter */}
      <div className="rounded-lg bg-white p-4">
        <h3 className="mb-4 text-base font-bold">인원 선택</h3>
        <GuestCounter
          adults={adults}
          childrenCount={childrenCount}
          onChangeAdults={onChangeAdults}
          onChangeChildren={onChangeChildren}
          maxGuests={selectedSite?.capacity || 10}
        />
      </div>

      {/* Price Breakdown */}
      {priceBreakdown &&
        priceBreakdown.dailyBreakdown &&
        priceBreakdown.dailyBreakdown.length > 0 && (
          <PriceBreakdownDisplay
            breakdown={priceBreakdown}
            showTitle={true}
            className="shadow-sm"
          />
        )}

      {/* Special Requests */}
      <div className="rounded-lg bg-white p-4">
        <h3 className="mb-2 text-base font-bold">특별 요청사항 (선택)</h3>
        <Textarea
          rows={4}
          placeholder="체크인 시간, 픽업 요청 등 추가 요청사항을 입력해주세요."
        />
      </div>

      {/* Payment Method */}
      <div className="rounded-lg bg-white p-4">
        <h3 className="mb-4 text-base font-bold">결제 수단</h3>
        <RadioGroup
          value={paymentMethod}
          onChange={(value) => onChangePaymentMethod(value as PaymentMethod)}
          name="paymentMethod"
        >
          <RadioGroupItem
            value="CARD"
            label="💳 신용/체크카드"
            description="즉시 결제 (토스페이먼츠)"
          />
          <RadioGroupItem
            value="BANK_TRANSFER"
            label="🏦 계좌이체"
            description="가상계좌로 입금 (30분 이내 입금 필요)"
          />
        </RadioGroup>

        {/* Depositor Name Input */}
        {paymentMethod === "BANK_TRANSFER" && (
          <div className="mt-4">
            <label className="mb-2 block text-sm font-medium text-neutral-700">
              입금자명 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={depositorName}
              onChange={(e) => onChangeDepositorName(e.target.value)}
              placeholder="입금하실 분의 성함을 입력해주세요"
              className="focus:border-primary w-full rounded-lg border border-neutral-300 p-3 focus:outline-none"
              required
            />
            <p className="mt-1 text-xs text-neutral-500">
              입금 확인을 위해 실제 입금하실 분의 성함을 정확히 입력해주세요.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
