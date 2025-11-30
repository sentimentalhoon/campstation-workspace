"use client";

import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import Calendar from "../Calendar";

type ReservationInfoProps = {
  onDateRangeChange?: (range: { start: Date; end: Date }) => void;
};

export default function ReservationInfo({
  onDateRangeChange,
}: ReservationInfoProps) {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [selectedRange, setSelectedRange] = useState<{
    start: Date;
    end: Date;
  }>({
    start: today,
    end: tomorrow,
  });
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const handleRangeChange = (range: { start: Date; end: Date }) => {
    setSelectedRange(range);
    onDateRangeChange?.(range);

    // 체크아웃 날짜까지 선택되면 캘린더 닫기
    if (range.start !== range.end) {
      setIsCalendarOpen(false);
    }
  };

  return (
    <div className="border-b border-neutral-200 bg-white px-4 py-4">
      {/* 예약 기간 정보 */}
      {/* 예약 기간 정보 */}
      <div className="mb-3">
        <div className="mb-1 flex items-center justify-between text-xs text-neutral-600">
          <span>예약가능</span>
          <span className="font-semibold text-orange-500">
            {format(selectedRange.end, "yyyy.MM.dd")}까지
          </span>
        </div>
        <div className="flex items-center justify-between text-xs text-neutral-600">
          <span>최대예약</span>
          <span>최대 6박 / 2개 까지</span>
        </div>
        <div className="flex items-center justify-between text-xs text-neutral-600">
          <span>오픈주기</span>
          <span>매월 27일 9시 오픈 (2개월 단위)</span>
        </div>
        <div className="flex items-center justify-between text-xs text-neutral-600">
          <span>다음예약</span>
          <span>
            {format(selectedRange.start, "yyyy.MM.dd")} 9시 오픈{" "}
            {format(selectedRange.end, "yyyy.MM.dd")}까지
          </span>
        </div>
      </div>

      {/* 날짜 선택 버튼 */}
      <button
        onClick={() => setIsCalendarOpen(!isCalendarOpen)}
        className="w-full rounded-lg border border-neutral-200 bg-white p-3 text-left transition-colors hover:border-orange-500"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="mb-1 flex items-center gap-2 text-sm">
              <span className="font-semibold">입실</span>
              <span className="font-bold text-neutral-900">
                {format(selectedRange.start, "yyyy.MM.dd", { locale: ko })}
              </span>
              <span className="text-neutral-500">~</span>
              <span className="font-semibold">퇴실</span>
              <span className="font-bold text-orange-500">
                {format(selectedRange.end, "yyyy.MM.dd(E)", { locale: ko })}
              </span>
            </div>
            <div className="text-xs text-neutral-500">
              🕐 현재시간 : {format(new Date(), "HH:mm:ss")}
            </div>
          </div>
          <ChevronDown
            className={`h-5 w-5 text-neutral-400 transition-transform ${
              isCalendarOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {/* 캘린더 (토글) */}
      {isCalendarOpen && (
        <div className="mt-3 rounded-lg border border-neutral-200 p-4">
          <Calendar
            selectedRange={selectedRange}
            onSelectRange={handleRangeChange}
            minDate={today}
          />
        </div>
      )}

      {/* 사이트 선택 안내 */}
      <div className="mt-3 rounded-lg bg-orange-50 p-3">
        <p className="text-center text-sm text-orange-600">
          ⚠️ 사이트(캠핑장)을 선택해주세요.
        </p>
      </div>
    </div>
  );
}
