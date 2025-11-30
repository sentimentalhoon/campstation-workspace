/**
 * 권한 유틸리티 함수 테스트
 */

import {
  hasAnyRole,
  hasRole,
  isAdmin,
  isAuthenticated,
  isOwner,
} from "@/lib/utils/permissions";
import { describe, expect, it } from "vitest";

describe("Permissions Utilities", () => {
  describe("hasRole", () => {
    it("ADMIN은 모든 권한을 가짐", () => {
      expect(hasRole("ADMIN", "OWNER")).toBe(true);
      expect(hasRole("ADMIN", "MEMBER")).toBe(true);
      expect(hasRole("ADMIN", "ADMIN")).toBe(true);
    });

    it("정확히 일치하는 권한만 통과", () => {
      expect(hasRole("OWNER", "OWNER")).toBe(true);
      expect(hasRole("OWNER", "MEMBER")).toBe(false);
      expect(hasRole("MEMBER", "OWNER")).toBe(false);
    });

    it("권한이 없으면 false 반환", () => {
      expect(hasRole(undefined, "OWNER")).toBe(false);
    });
  });

  describe("hasAnyRole", () => {
    it("ADMIN은 모든 권한을 가짐", () => {
      expect(hasAnyRole("ADMIN", ["OWNER", "MEMBER"])).toBe(true);
    });

    it("하나라도 일치하면 true", () => {
      expect(hasAnyRole("OWNER", ["OWNER", "ADMIN"])).toBe(true);
      expect(hasAnyRole("MEMBER", ["MEMBER", "ADMIN"])).toBe(true);
    });

    it("일치하는 권한이 없으면 false", () => {
      expect(hasAnyRole("MEMBER", ["OWNER", "ADMIN"])).toBe(false);
    });

    it("권한이 없으면 false 반환", () => {
      expect(hasAnyRole(undefined, ["OWNER"])).toBe(false);
    });
  });

  describe("isOwner", () => {
    it("OWNER는 true", () => {
      expect(isOwner("OWNER")).toBe(true);
    });

    it("ADMIN도 true (모든 권한)", () => {
      expect(isOwner("ADMIN")).toBe(true);
    });

    it("MEMBER는 false", () => {
      expect(isOwner("MEMBER")).toBe(false);
    });

    it("권한이 없으면 false", () => {
      expect(isOwner(undefined)).toBe(false);
    });
  });

  describe("isAdmin", () => {
    it("ADMIN만 true", () => {
      expect(isAdmin("ADMIN")).toBe(true);
    });

    it("OWNER는 false", () => {
      expect(isAdmin("OWNER")).toBe(false);
    });

    it("MEMBER는 false", () => {
      expect(isAdmin("MEMBER")).toBe(false);
    });

    it("권한이 없으면 false", () => {
      expect(isAdmin(undefined)).toBe(false);
    });
  });

  describe("isAuthenticated", () => {
    it("권한이 있으면 true", () => {
      expect(isAuthenticated("ADMIN")).toBe(true);
      expect(isAuthenticated("OWNER")).toBe(true);
      expect(isAuthenticated("MEMBER")).toBe(true);
    });

    it("권한이 없으면 false", () => {
      expect(isAuthenticated(undefined)).toBe(false);
    });
  });
});
