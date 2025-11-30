/**
 * Step1DateSelection Component
 * Date range selection with calendar and summary
 * React 19+ with React Compiler auto-optimization
 */

import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import dynamic from "next/dynamic";

// Dynamic import for Calendar component
const Calendar = dynamic(() => import("@/components/features/Calendar"), {
  loading: () => (
    <div className="flex h-96 items-center justify-center">
      <LoadingSpinner />
    </div>
  ),
  ssr: false,
});

interface Step1DateSelectionProps {
  dateRange: { start: Date; end: Date } | undefined;
  nights: number;
  onSelectRange: (range: { start: Date; end: Date } | undefined) => void;
}

export function Step1DateSelection({
  dateRange,
  nights,
  onSelectRange,
}: Step1DateSelectionProps) {
  return (
    <div className="rounded-lg bg-white p-4">
      <h3 className="mb-4 text-base font-bold">날짜 선택</h3>
      <Calendar
        selectedRange={dateRange}
        onSelectRange={onSelectRange}
        minDate={new Date()}
      />
      {dateRange && nights > 0 && (
        <div className="mt-4 rounded-lg bg-neutral-50 p-3">
          <div className="text-sm text-neutral-600">
            체크인:{" "}
            {dateRange.start.toLocaleDateString("ko-KR", {
              month: "long",
              day: "numeric",
              weekday: "short",
            })}
          </div>
          <div className="text-sm text-neutral-600">
            체크아웃:{" "}
            {dateRange.end.toLocaleDateString("ko-KR", {
              month: "long",
              day: "numeric",
              weekday: "short",
            })}
          </div>
          <div className="text-primary mt-1 font-bold">총 {nights}박</div>
        </div>
      )}
    </div>
  );
}
