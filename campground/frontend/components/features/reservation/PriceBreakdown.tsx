/**
 * PriceBreakdown 컴포넌트
 * 결제 금액 상세 내역 표시
 *
 * @see docs/sprints/sprint-2.md
 * @see docs/specifications/06-SCREEN-LAYOUTS.md - 결제 페이지
 */

import { cn } from "@/lib/utils";

type PriceBreakdownProps = {
  basePrice: number; // 1박 기본 가격
  nights: number; // 숙박 일수
  discount?: number; // 할인 금액 (옵션)
  className?: string;
};

export function PriceBreakdown({
  basePrice,
  nights,
  discount = 0,
  className,
}: PriceBreakdownProps) {
  const subtotal = basePrice * nights;
  const total = subtotal - discount;

  const formatPrice = (price: number) => {
    return `₩${price.toLocaleString()}`;
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* 사이트 요금 */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-neutral-600">
          사이트 요금 ({nights}박 × {formatPrice(basePrice)})
        </span>
        <span className="font-medium">{formatPrice(subtotal)}</span>
      </div>

      {/* 할인 (있는 경우) */}
      {discount > 0 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-neutral-600">할인</span>
          <span className="text-error font-medium">
            -{formatPrice(discount)}
          </span>
        </div>
      )}

      {/* 구분선 */}
      <div className="border-t border-neutral-200" />

      {/* 총 결제 금액 */}
      <div className="flex items-center justify-between">
        <span className="text-base font-bold">총 결제 금액</span>
        <span className="text-primary text-xl font-bold">
          {formatPrice(total)}
        </span>
      </div>
    </div>
  );
}
