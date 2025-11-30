/**
 * PriceBreakdownDisplay Component
 * 예약 가격 상세 내역 표시 컴포넌트
 */

"use client";

import type { PriceBreakdown } from "@/types/domain/pricing";
import { formatPriceNumber, isDiscountItem, isSurchargeItem } from "@/types/domain/pricing";

interface PriceBreakdownDisplayProps {
  breakdown: PriceBreakdown;
  className?: string;
  showTitle?: boolean;
}

export function PriceBreakdownDisplay({
  breakdown,
  className = "",
  showTitle = true,
}: PriceBreakdownDisplayProps) {
  const hasDailyBreakdown = breakdown.dailyBreakdown && breakdown.dailyBreakdown.length > 0;
  const hasItems = breakdown.items && breakdown.items.length > 0;

  return (
    <div className={`rounded-lg border border-neutral-200 bg-white p-4 ${className}`}>
      {showTitle && (
        <h3 className="mb-4 text-lg font-bold text-neutral-900">
          요금 상세 내역
        </h3>
      )}

      <div className="space-y-2">
        {/* dailyBreakdown 우선 사용 (새 형식) */}
        {hasDailyBreakdown && (
          <div className="space-y-2">
            <div className="text-xs font-medium text-neutral-500 mb-2">
              일별 요금
            </div>
            {breakdown.dailyBreakdown!.map((day, index) => {
              const dateObj = new Date(day.date);
              const dayOfWeek = dateObj.toLocaleDateString("ko-KR", { weekday: "short" });

              return (
                <div
                  key={index}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-700">
                      {dateObj.toLocaleDateString("ko-KR", {
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      ({dayOfWeek})
                    </span>
                    {day.weekend && (
                      <span className="rounded bg-orange-100 px-1.5 py-0.5 text-xs text-orange-700">
                        주말
                      </span>
                    )}
                  </div>
                  <span className={`font-medium ${day.weekend ? "text-orange-600" : "text-neutral-900"}`}>
                    {formatPriceNumber(day.dailyRate)}원
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* items 사용 (레거시 형식) - dailyBreakdown이 없을 때 */}
        {!hasDailyBreakdown && hasItems && (
          <div className="space-y-2">
            {breakdown.items!
              .sort((a, b) => a.displayOrder - b.displayOrder)
              .map((item, index) => {
                const isDiscount = isDiscountItem(item.type);
                const isSurcharge = isSurchargeItem(item.type);

                return (
                  <div
                    key={index}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-neutral-700">{item.name}</span>
                      {isDiscount && (
                        <span className="rounded bg-green-100 px-1.5 py-0.5 text-xs text-green-700">
                          할인
                        </span>
                      )}
                      {isSurcharge && (
                        <span className="rounded bg-orange-100 px-1.5 py-0.5 text-xs text-orange-700">
                          할증
                        </span>
                      )}
                    </div>
                    <span
                      className={`font-medium ${
                        isDiscount
                          ? "text-green-600"
                          : isSurcharge
                            ? "text-orange-600"
                            : "text-neutral-900"
                      }`}
                    >
                      {isDiscount ? "-" : ""}
                      {formatPriceNumber(Math.abs(item.amount))}원
                    </span>
                  </div>
                );
              })}
          </div>
        )}

        {/* appliedDiscounts 사용 (새 형식) - dailyBreakdown이 있을 때만 */}
        {hasDailyBreakdown && (
          <>
            {/* 추가 인원 요금 */}
            {breakdown.extraGuestFee > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-700">추가 인원 요금</span>
                <span className="font-medium text-neutral-900">
                  {formatPriceNumber(breakdown.extraGuestFee)}원
                </span>
              </div>
            )}

            {/* 소계 */}
            <div className="my-3 border-t border-neutral-200 pt-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-600">소계</span>
                <span className="font-medium text-neutral-900">
                  {formatPriceNumber(breakdown.subtotal)}원
                </span>
              </div>
            </div>

            {/* 적용된 할인 */}
            {breakdown.appliedDiscounts && breakdown.appliedDiscounts.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-medium text-neutral-500 mb-2">
                  할인 내역
                </div>
                {breakdown.appliedDiscounts.map((discount, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-neutral-700">{discount.description}</span>
                      <span className="rounded bg-green-100 px-1.5 py-0.5 text-xs text-green-700">
                        {discount.discountRate}%
                      </span>
                    </div>
                    <span className="font-medium text-green-600">
                      -{formatPriceNumber(discount.discountAmount)}원
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* 최종 결제 금액 */}
        <div className="mt-4 flex items-center justify-between border-t-2 border-neutral-900 pt-3">
          <span className="text-base font-bold text-neutral-900">
            총 결제 금액
          </span>
          <span className="text-xl font-bold text-primary-600">
            {formatPriceNumber(breakdown.totalAmount)}원
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * 간단한 가격 요약 컴포넌트 (카드용)
 */
export function PriceBreakdownSummary({
  breakdown,
  className = "",
}: {
  breakdown: PriceBreakdown;
  className?: string;
}) {
  const hasDiscount = breakdown.totalDiscount > 0;

  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex items-baseline justify-between">
        <span className="text-sm text-neutral-600">기본 요금</span>
        <span className="text-sm font-medium text-neutral-900">
          {formatPriceNumber(breakdown.basePrice)}원
        </span>
      </div>

      {hasDiscount && (
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-neutral-600">할인</span>
          <span className="text-sm font-medium text-green-600">
            -{formatPriceNumber(breakdown.totalDiscount)}원
          </span>
        </div>
      )}

      <div className="flex items-baseline justify-between border-t pt-1">
        <span className="text-base font-bold text-neutral-900">총액</span>
        <span className="text-lg font-bold text-primary-600">
          {formatPriceNumber(breakdown.totalAmount)}원
        </span>
      </div>
    </div>
  );
}
