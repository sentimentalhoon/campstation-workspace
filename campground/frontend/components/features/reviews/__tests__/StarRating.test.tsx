import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import StarRating from "../StarRating";

describe("StarRating", () => {
  it("현재 별점이 렌더링된다", () => {
    render(<StarRating value={3} readOnly />);
    // 5개의 별이 모두 렌더링되는지 확인
    const stars = screen.getAllByRole("button");
    expect(stars).toHaveLength(5);
  });

  it("readOnly 모드에서는 클릭이 실행되지 않는다", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<StarRating value={3} onChange={handleChange} readOnly />);

    const stars = screen.getAllByRole("button");
    await user.click(stars[4]);

    expect(handleChange).not.toHaveBeenCalled();
  });

  it("별점 변경이 가능하다", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<StarRating value={3} onChange={handleChange} />);

    const stars = screen.getAllByRole("button");
    await user.click(stars[4]); // 5번째 별 클릭

    expect(handleChange).toHaveBeenCalledWith(5);
  });

  it("size에 따라 다른 크기가 적용된다", () => {
    const { rerender } = render(<StarRating value={3} size="sm" readOnly />);
    const smallStar = screen.getAllByRole("button")[0].querySelector("svg");
    expect(smallStar).toHaveClass("h-4");

    rerender(<StarRating value={3} size="md" readOnly />);
    const mediumStar = screen.getAllByRole("button")[0].querySelector("svg");
    expect(mediumStar).toHaveClass("h-6");

    rerender(<StarRating value={3} size="lg" readOnly />);
    const largeStar = screen.getAllByRole("button")[0].querySelector("svg");
    expect(largeStar).toHaveClass("h-8");
  });

  it("showLabel이 true일 때 별점 텍스트가 표시된다", () => {
    render(<StarRating value={4} showLabel readOnly />);
    expect(screen.getByText("4.0")).toBeInTheDocument();
  });
});
