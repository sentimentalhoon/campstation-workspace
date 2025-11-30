import { describe, expect, it } from "vitest";
import {
  formatBusinessNumber,
  formatFileSize,
  formatKRW,
  formatPhoneNumber,
} from "../number";

describe("number utils", () => {
  describe("formatKRW", () => {
    it("숫자를 한국 원화 형식으로 변환한다", () => {
      expect(formatKRW(15000)).toBe("15,000원");
      expect(formatKRW(1000000)).toBe("1,000,000원");
      expect(formatKRW(0)).toBe("0원");
    });
  });

  describe("formatPhoneNumber", () => {
    it("11자리 전화번호를 포맷한다", () => {
      expect(formatPhoneNumber("01012345678")).toBe("010-1234-5678");
    });

    it("10자리 전화번호를 포맷한다", () => {
      expect(formatPhoneNumber("0212345678")).toBe("02-123-5678");
    });

    it("잘못된 형식은 그대로 반환한다", () => {
      expect(formatPhoneNumber("123")).toBe("123");
    });

    it("하이픈이 포함된 번호도 처리한다", () => {
      expect(formatPhoneNumber("010-1234-5678")).toBe("010-1234-5678");
    });
  });

  describe("formatBusinessNumber", () => {
    it("사업자 등록번호를 포맷한다", () => {
      expect(formatBusinessNumber("1234567890")).toBe("123-45-67890");
    });

    it("잘못된 형식은 그대로 반환한다", () => {
      expect(formatBusinessNumber("123")).toBe("123");
    });

    it("하이픈이 포함된 번호도 처리한다", () => {
      expect(formatBusinessNumber("123-45-67890")).toBe("123-45-67890");
    });
  });

  describe("formatFileSize", () => {
    it("0 바이트를 포맷한다", () => {
      expect(formatFileSize(0)).toBe("0 Bytes");
    });

    it("KB 단위로 포맷한다", () => {
      expect(formatFileSize(1024)).toBe("1.00 KB");
    });

    it("MB 단위로 포맷한다", () => {
      expect(formatFileSize(1024 * 1024)).toBe("1.00 MB");
    });

    it("GB 단위로 포맷한다", () => {
      expect(formatFileSize(1024 * 1024 * 1024)).toBe("1.00 GB");
    });
  });
});
