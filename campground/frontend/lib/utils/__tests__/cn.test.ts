import { describe, expect, it } from "vitest";
import { cn } from "../cn";

describe("cn utility", () => {
  it("여러 클래스를 결합한다", () => {
    const result = cn("text-red-500", "bg-blue-500");
    expect(result).toBe("text-red-500 bg-blue-500");
  });

  it("조건부 클래스를 처리한다", () => {
    const result = cn("base-class", true && "active", false && "inactive");
    expect(result).toBe("base-class active");
  });

  it("객체 형식의 조건부 클래스를 처리한다", () => {
    const result = cn({
      "text-red-500": true,
      "text-green-500": false,
      "bg-blue-500": true,
    });
    expect(result).toBe("text-red-500 bg-blue-500");
  });

  it("빈 값을 무시한다", () => {
    const result = cn("base", null, undefined, "", "active");
    expect(result).toBe("base active");
  });

  it("배열을 처리한다", () => {
    const result = cn(["text-red-500", "bg-blue-500"]);
    expect(result).toBe("text-red-500 bg-blue-500");
  });
});
