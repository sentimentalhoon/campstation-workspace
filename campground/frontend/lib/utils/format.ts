import { format, formatDistance, parseISO } from "date-fns";
import { ko } from "date-fns/locale";

/**
 * 날짜 포맷 유틸리티
 */

/**
 * UTC 문자열을 로컬 시간대로 변환
 * DB에서 가져온 UTC 시간을 브라우저의 로컬 시간대로 변환합니다.
 * 시간대 정보가 없는 문자열은 UTC로 간주합니다.
 *
 * @param utcDate - UTC 시간 문자열 (ISO 8601 형식)
 * @returns 로컬 시간대의 Date 객체
 *
 * @example
 * // DB: "2024-01-15T05:30:00Z" (UTC)
 * // 한국 (UTC+9): 2024-01-15 14:30
 * const localDate = parseUTCToLocal("2024-01-15T05:30:00Z");
 *
 * @example
 * // DB: "2024-01-15T05:30:00.340984" (시간대 정보 없음 → UTC로 간주)
 * // 한국 (UTC+9): 2024-01-15 14:30
 * const localDate = parseUTCToLocal("2024-01-15T05:30:00.340984");
 */
export function parseUTCToLocal(
  utcDate: string | Date | null | undefined
): Date {
  if (!utcDate) {
    console.error("parseUTCToLocal: utcDate is null or undefined");
    return new Date(NaN); // Invalid Date
  }

  if (typeof utcDate === "string") {
    try {
      // 시간대 정보가 없으면 UTC로 간주하고 'Z' 추가
      let dateString = utcDate;
      if (
        !utcDate.endsWith("Z") &&
        !utcDate.includes("+") &&
        !utcDate.match(/[+-]\d{2}:\d{2}$/)
      ) {
        // 마이크로초 제거 (ISO 8601에서는 최대 밀리초까지만 지원)
        dateString = utcDate.replace(/\.\d{6}/, (match) => {
          return match.substring(0, 4); // .340984 → .340
        });
        dateString = dateString + "Z";
      }

      // ISO 문자열 파싱 → 자동으로 로컬 시간으로 변환됨
      const date = parseISO(dateString);
      return date;
    } catch (error) {
      console.error("parseUTCToLocal error:", error, "utcDate:", utcDate);
      return new Date(NaN);
    }
  }
  return utcDate;
}

/**
 * 로컬 시간을 UTC로 변환
 * 사용자가 입력한 로컬 시간을 UTC로 변환하여 DB에 저장할 때 사용합니다.
 *
 * @param localDate - 로컬 시간 Date 객체
 * @returns UTC ISO 문자열
 *
 * @example
 * // 로컬: 2024-01-15 14:30 (한국 UTC+9)
 * // UTC: "2024-01-15T05:30:00.000Z"
 * const utcString = formatLocalToUTC(new Date(2024, 0, 15, 14, 30));
 */
export function formatLocalToUTC(localDate: Date): string {
  return localDate.toISOString();
}

/**
 * ISO 문자열을 날짜 형식으로 변환 (시간 제외)
 * UTC 시간을 자동으로 로컬 시간으로 변환합니다.
 *
 * @example formatDate("2024-01-15T05:30:00Z") => "2024년 1월 15일" (UTC+9 기준)
 */
export function formatDate(date: string | Date): string {
  try {
    const dateObj = typeof date === "string" ? parseUTCToLocal(date) : date;
    if (!dateObj || isNaN(dateObj.getTime())) {
      console.error("Invalid date value:", date);
      return "-";
    }
    return format(dateObj, "yyyy년 M월 d일", { locale: ko });
  } catch (error) {
    console.error("formatDate error:", error, "date:", date);
    return "-";
  }
}

/**
 * ISO 문자열을 시간 포함 형식으로 변환
 * UTC 시간을 자동으로 로컬 시간으로 변환합니다.
 *
 * @example formatDateTime("2024-01-15T05:30:00Z") => "2024년 1월 15일 14:30" (UTC+9 기준)
 */
export function formatDateTime(date: string | Date): string {
  try {
    const dateObj = typeof date === "string" ? parseUTCToLocal(date) : date;
    if (!dateObj || isNaN(dateObj.getTime())) {
      console.error("Invalid date value:", date);
      return "-";
    }
    return format(dateObj, "yyyy년 M월 d일 HH:mm", { locale: ko });
  } catch (error) {
    console.error("formatDateTime error:", error, "date:", date);
    return "-";
  }
}

/**
 * 상대 시간 표시
 * UTC 시간을 자동으로 로컬 시간으로 변환합니다.
 *
 * @example formatRelativeTime("2024-01-15T05:30:00Z") => "3일 전" (로컬 시간 기준)
 */
export function formatRelativeTime(date: string | Date): string {
  try {
    const dateObj = typeof date === "string" ? parseUTCToLocal(date) : date;
    if (!dateObj || isNaN(dateObj.getTime())) {
      console.error("Invalid date value:", date);
      return "-";
    }
    return formatDistance(dateObj, new Date(), {
      addSuffix: true,
      locale: ko,
    });
  } catch (error) {
    console.error("formatRelativeTime error:", error, "date:", date);
    return "-";
  }
}

/**
 * 날짜 범위 포맷
 * UTC 시간을 자동으로 로컬 시간으로 변환합니다.
 *
 * @example formatDateRange("2024-01-15T05:30:00Z", "2024-01-17T05:30:00Z") => "2024년 1월 15일 ~ 17일"
 */
export function formatDateRange(
  startDate: string | Date,
  endDate: string | Date
): string {
  const start =
    typeof startDate === "string" ? parseUTCToLocal(startDate) : startDate;
  const end = typeof endDate === "string" ? parseUTCToLocal(endDate) : endDate;

  const startFormatted = format(start, "yyyy년 M월 d일");
  const endFormatted = format(end, "d일");

  return `${startFormatted} ~ ${endFormatted}`;
}

/**
 * 간단한 날짜 포맷 (연도 제외)
 * UTC 시간을 자동으로 로컬 시간으로 변환합니다.
 *
 * @example formatShortDate("2024-01-15T05:30:00Z") => "1월 15일"
 */
export function formatShortDate(date: string | Date): string {
  const dateObj = typeof date === "string" ? parseUTCToLocal(date) : date;
  return format(dateObj, "M월 d일", { locale: ko });
}

/**
 * 시간만 포맷
 * UTC 시간을 자동으로 로컬 시간으로 변환합니다.
 *
 * @example formatTime("2024-01-15T05:30:00Z") => "14:30"
 */
export function formatTime(date: string | Date): string {
  const dateObj = typeof date === "string" ? parseUTCToLocal(date) : date;
  return format(dateObj, "HH:mm", { locale: ko });
}

/**
 * 시간만 포맷 (시 단위)
 * "HH:mm:ss" 또는 Date 형식을 "HH시" 형식으로 변환합니다.
 *
 * @example formatHour("14:00:00") => "14시"
 * @example formatHour("09:30:00") => "09시"
 */
export function formatHour(time: string | Date): string {
  if (typeof time === "string") {
    // "HH:mm:ss" 형식에서 시간만 추출
    const hour = time.split(":")[0];
    return `${hour}시`;
  }
  // Date 객체인 경우
  return format(time, "HH시", { locale: ko });
}

/**
 * 요일 포함 날짜 포맷
 * UTC 시간을 자동으로 로컬 시간으로 변환합니다.
 *
 * @example formatDateWithDay("2024-01-15T05:30:00Z") => "1월 15일 (월)"
 */
export function formatDateWithDay(date: string | Date): string {
  try {
    if (!date) {
      console.error("formatDateWithDay: date is undefined or null");
      return "-";
    }
    const dateObj = typeof date === "string" ? parseUTCToLocal(date) : date;
    if (!dateObj || isNaN(dateObj.getTime())) {
      console.error("Invalid date value in formatDateWithDay:", date);
      return "-";
    }
    return format(dateObj, "M월 d일 (E)", { locale: ko });
  } catch (error) {
    console.error("formatDateWithDay error:", error, "date:", date);
    return "-";
  }
}

/**
 * 요일 포함 날짜/시간 포맷
 * UTC 시간을 자동으로 로컬 시간으로 변환합니다.
 *
 * @example formatDateTimeWithDay("2024-01-15T05:30:00Z") => "1월 15일 (월) 14:30"
 */
export function formatDateTimeWithDay(date: string | Date): string {
  const dateObj = typeof date === "string" ? parseUTCToLocal(date) : date;
  return format(dateObj, "M월 d일 (E) HH:mm", { locale: ko });
}

/**
 * 가격 포맷
 * @example formatPrice(10000) => "10,000"
 */
export function formatPrice(price: number): string {
  return price.toLocaleString("ko-KR");
}
