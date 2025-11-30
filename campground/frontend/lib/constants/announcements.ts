/**
 * 공지사항 관련 상수
 */

import type { AnnouncementType } from "@/types";

/**
 * 공지사항 타입 레이블
 */
export const ANNOUNCEMENT_TYPE_LABELS: Record<AnnouncementType, string> = {
  NOTICE: "공지사항",
  EVENT: "이벤트",
  FACILITY: "시설안내",
  URGENT: "긴급공지",
};

/**
 * 공지사항 타입 색상 (Tailwind classes)
 */
export const ANNOUNCEMENT_TYPE_COLORS: Record<
  AnnouncementType,
  {
    bg: string;
    text: string;
    border: string;
  }
> = {
  NOTICE: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  EVENT: {
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
  },
  FACILITY: {
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
  },
  URGENT: {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
  },
};

/**
 * 공지사항 타입 아이콘
 */
export const ANNOUNCEMENT_TYPE_ICONS: Record<AnnouncementType, string> = {
  NOTICE: "📢",
  EVENT: "🎉",
  FACILITY: "🏕️",
  URGENT: "🚨",
};
