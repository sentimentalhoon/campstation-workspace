import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ErrorMessage } from "../ErrorMessage";

describe("ErrorMessage", () => {
  it("에러 메시지가 렌더링된다", () => {
    render(<ErrorMessage message="에러가 발생했습니다" />);
    expect(screen.getByText("에러가 발생했습니다")).toBeInTheDocument();
  });

  it("기본 에러 아이콘이 표시된다", () => {
    render(<ErrorMessage message="에러" />);
    const container = screen.getByText("에러").closest("div");
    expect(container).toHaveClass("text-error");
  });

  it("커스텀 className이 적용된다", () => {
    render(<ErrorMessage message="에러" className="custom-class" />);
    const container = screen.getByText("에러").closest("div");
    expect(container).toHaveClass("custom-class");
  });
});
