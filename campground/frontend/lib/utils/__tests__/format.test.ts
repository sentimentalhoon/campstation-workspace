import { describe, expect, it } from "vitest";
import {
  formatDate,
  formatDateRange,
  formatDateTime,
  formatRelativeTime,
} from "../format";

describe("format utils", () => {
  describe("formatDate", () => {
    it("ISO 문자열을 한국어 날짜로 변환한다", () => {
      const result = formatDate("2024-01-15");
      expect(result).toBe("2024년 1월 15일");
    });

    it("Date 객체를 한국어 날짜로 변환한다", () => {
      const date = new Date("2024-01-15");
      const result = formatDate(date);
      expect(result).toBe("2024년 1월 15일");
    });
  });

  describe("formatDateTime", () => {
    it("ISO 문자열을 날짜 시간 형식으로 변환한다", () => {
      const result = formatDateTime("2024-01-15T14:30:00");
      expect(result).toBe("2024년 1월 15일 14:30");
    });

    it("Date 객체를 날짜 시간 형식으로 변환한다", () => {
      const date = new Date("2024-01-15T14:30:00");
      const result = formatDateTime(date);
      expect(result).toBe("2024년 1월 15일 14:30");
    });
  });

  describe("formatRelativeTime", () => {
    it("과거 날짜를 상대 시간으로 표시한다", () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 3);

      const result = formatRelativeTime(pastDate);
      expect(result).toContain("전");
    });
  });

  describe("formatDateRange", () => {
    it("날짜 범위를 포맷한다", () => {
      const result = formatDateRange("2024-01-15", "2024-01-17");
      expect(result).toBe("2024년 1월 15일 ~ 17일");
    });
  });
});
