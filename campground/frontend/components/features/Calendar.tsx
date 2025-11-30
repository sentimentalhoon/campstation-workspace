"use client";

import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  isWithinInterval,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ko } from "date-fns/locale";
import { useState } from "react";

type CalendarProps = {
  selectedRange?: { start: Date; end: Date };
  onSelectRange: (range: { start: Date; end: Date }) => void;
  disabledDates?: Date[];
  minDate?: Date;
  maxDate?: Date;
  className?: string;
};

export default function Calendar({
  selectedRange,
  onSelectRange,
  disabledDates = [],
  minDate = new Date(),
  maxDate,
  className = "",
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectingStart, setSelectingStart] = useState(true);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const isDateDisabled = (date: Date): boolean => {
    const dayStart = startOfDay(date);

    // 과거 날짜 체크
    if (minDate && isBefore(dayStart, startOfDay(minDate))) {
      return true;
    }

    // 최대 날짜 체크
    if (maxDate && isAfter(dayStart, startOfDay(maxDate))) {
      return true;
    }

    // 수동으로 비활성화된 날짜 체크
    return disabledDates.some((disabledDate) =>
      isSameDay(dayStart, startOfDay(disabledDate))
    );
  };

  const handleDateClick = (date: Date) => {
    if (isDateDisabled(date)) return;

    if (selectingStart || !selectedRange) {
      // 체크인 날짜 선택
      onSelectRange({ start: date, end: date });
      setSelectingStart(false);
    } else {
      // 체크아웃 날짜 선택
      if (isBefore(date, selectedRange.start)) {
        // 체크인보다 이전 날짜를 선택한 경우, 새로운 체크인으로 설정
        onSelectRange({ start: date, end: date });
      } else {
        // 정상적인 체크아웃 선택
        onSelectRange({ start: selectedRange.start, end: date });
        setSelectingStart(true);
      }
    }
  };

  const isDateSelected = (date: Date): boolean => {
    if (!selectedRange) return false;

    return (
      isSameDay(date, selectedRange.start) ||
      isSameDay(date, selectedRange.end) ||
      (isAfter(date, selectedRange.start) && isBefore(date, selectedRange.end))
    );
  };

  const isDateInRange = (date: Date): boolean => {
    if (!selectedRange) return false;

    return (
      isWithinInterval(date, {
        start: selectedRange.start,
        end: selectedRange.end,
      }) && !isSameDay(date, selectedRange.start)
    );
  };

  const renderDays = () => {
    const days = [];
    let day = calendarStart;

    while (day <= calendarEnd) {
      days.push(day);
      day = addDays(day, 1);
    }

    return days;
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={handlePrevMonth}
          className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-neutral-100"
          aria-label="이전 달"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <h2 className="text-lg font-bold">
          {format(currentMonth, "yyyy년 M월", { locale: ko })}
        </h2>
        <button
          onClick={handleNextMonth}
          className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-neutral-100"
          aria-label="다음 달"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* Weekday Labels */}
      <div className="mb-2 grid grid-cols-7">
        {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
          <div
            key={day}
            className="py-2 text-center text-sm font-medium text-neutral-500"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {renderDays().map((date, index) => {
          const isDisabled = isDateDisabled(date);
          const isSelected = isDateSelected(date);
          const isInRange = isDateInRange(date);
          const isCurrentMonthDate = isSameMonth(date, currentMonth);
          const isStartDate =
            selectedRange && isSameDay(date, selectedRange.start);
          const isEndDate = selectedRange && isSameDay(date, selectedRange.end);

          return (
            <button
              key={index}
              onClick={() => handleDateClick(date)}
              disabled={isDisabled}
              className={`relative flex aspect-square items-center justify-center rounded-lg text-sm transition-colors ${!isCurrentMonthDate ? "text-neutral-300" : ""} ${isDisabled ? "cursor-not-allowed text-neutral-300" : ""} ${
                !isDisabled && !isSelected ? "hover:bg-neutral-100" : ""
              } ${isInRange ? "bg-primary/10" : ""} ${isStartDate || isEndDate ? "bg-primary font-bold text-white" : ""} ${isSelected && !isStartDate && !isEndDate ? "bg-primary/20" : ""} `}
            >
              {format(date, "d")}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 border-t border-neutral-200 pt-4">
        <div className="flex items-center gap-4 text-sm text-neutral-600">
          <div className="flex items-center gap-2">
            <div className="bg-primary h-6 w-6 rounded"></div>
            <span>체크인/체크아웃</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 h-6 w-6 rounded"></div>
            <span>선택된 기간</span>
          </div>
        </div>
      </div>
    </div>
  );
}
