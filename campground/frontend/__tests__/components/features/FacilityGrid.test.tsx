import FacilityGrid from "@/components/features/FacilityGrid";
import { render, screen } from "@testing-library/react";

describe("FacilityGrid", () => {
  const mockFacilities = ["전기", "화장실", "샤워실", "와이파이"];

  it("빈 배열일 때 아무것도 렌더링하지 않음", () => {
    const { container } = render(<FacilityGrid facilities={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("제공된 편의시설을 렌더링함", () => {
    render(<FacilityGrid facilities={mockFacilities} />);

    expect(screen.getByText("전기")).toBeInTheDocument();
    expect(screen.getByText("화장실")).toBeInTheDocument();
    expect(screen.getByText("샤워실")).toBeInTheDocument();
    expect(screen.getByText("와이파이")).toBeInTheDocument();
  });

  it("올바른 아이콘을 표시함", () => {
    render(<FacilityGrid facilities={["전기", "화장실"]} />);

    // 아이콘이 텍스트로 표시되는지 확인
    expect(screen.getByText("⚡")).toBeInTheDocument(); // 전기 아이콘
    expect(screen.getByText("🚻")).toBeInTheDocument(); // 화장실 아이콘
  });

  it("columns prop에 따라 그리드 컬럼을 설정함", () => {
    const { container } = render(
      <FacilityGrid facilities={mockFacilities} columns={3} />
    );

    const gridElement = container.querySelector(".grid");
    expect(gridElement).toHaveClass("grid-cols-3");
  });

  it("기본 컬럼이 4개임", () => {
    const { container } = render(<FacilityGrid facilities={mockFacilities} />);

    const gridElement = container.querySelector(".grid");
    expect(gridElement).toHaveClass("grid-cols-4");
  });

  it("커스텀 className을 적용함", () => {
    const { container } = render(
      <FacilityGrid facilities={mockFacilities} className="custom-class" />
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("등록되지 않은 편의시설은 기본 아이콘(✓)을 표시함", () => {
    render(<FacilityGrid facilities={["알수없는시설"]} />);

    expect(screen.getByText("✓")).toBeInTheDocument();
    expect(screen.getByText("알수없는시설")).toBeInTheDocument();
  });
});
