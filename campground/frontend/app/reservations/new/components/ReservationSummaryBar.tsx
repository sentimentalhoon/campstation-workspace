/**
 * ReservationSummaryBar Component
 * Sticky bottom bar with price summary and action button
 * React 19+ with React Compiler auto-optimization
 */

import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import type { Site } from "@/types/domain/campground";

interface ReservationSummaryBarProps {
  step: 1 | 2 | 3;
  nights: number;
  selectedSite: Site | undefined;
  totalPrice: number;
  canGoNext: boolean;
  isCreatingReservation: boolean;
  onNext: () => void;
}

export function ReservationSummaryBar({
  step,
  nights,
  selectedSite,
  totalPrice,
  canGoNext,
  isCreatingReservation,
  onNext,
}: ReservationSummaryBarProps) {
  return (
    <div className="max-w-640px fixed right-0 bottom-14 left-0 z-40 mx-auto border-t border-neutral-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <div>
          {totalPrice > 0 && (
            <>
              <div className="text-sm text-neutral-500">
                {nights}박 × ₩{selectedSite?.basePrice.toLocaleString()}
              </div>
              <div className="text-primary text-xl font-bold">
                총 ₩{totalPrice.toLocaleString()}
              </div>
            </>
          )}
        </div>
        <Button
          onClick={onNext}
          disabled={!canGoNext || isCreatingReservation}
          size="lg"
          className="min-w-[120px]"
        >
          {isCreatingReservation ? (
            <LoadingSpinner size="sm" />
          ) : step === 3 ? (
            "예약하기"
          ) : (
            "다음"
          )}
        </Button>
      </div>
    </div>
  );
}
