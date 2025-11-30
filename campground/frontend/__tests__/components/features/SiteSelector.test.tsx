import SiteSelector from "@/components/features/SiteSelector";
import type { Site } from "@/types/domain/campground";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

describe("SiteSelector", () => {
  const mockSites: Site[] = [
    {
      id: 1,
      campgroundId: 1,
      siteNumber: "A-01",
      siteType: "CARAVAN",
      capacity: 4,
      description: "Auto camping site",
      amenities: ["ELECTRICITY", "WATER", "PARKING"],
      basePrice: 50000,
      latitude: 37.5,
      longitude: 127.0,
      status: "AVAILABLE",
    },
    {
      id: 2,
      campgroundId: 1,
      siteNumber: "B-01",
      siteType: "GLAMP",
      capacity: 6,
      description: "Glamping site",
      amenities: ["ELECTRICITY", "WATER", "WIFI", "HEATING"],
      basePrice: 80000,
      latitude: 37.5,
      longitude: 127.0,
      status: "AVAILABLE",
    },
    {
      id: 3,
      campgroundId: 1,
      siteNumber: "C-01",
      siteType: "CABIN",
      capacity: 5,
      description: "Cabin site",
      amenities: ["ELECTRICITY", "WATER"],
      basePrice: 60000,
      latitude: 37.5,
      longitude: 127.0,
      status: "UNAVAILABLE",
    },
  ];

  const mockOnSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("빈 배열일 때 안내 메시지를 표시함", () => {
    render(<SiteSelector sites={[]} onSelect={mockOnSelect} />);

    expect(
      screen.getByText("예약 가능한 사이트가 없습니다")
    ).toBeInTheDocument();
  });

  it("모든 사이트를 렌더링함", () => {
    render(<SiteSelector sites={mockSites} onSelect={mockOnSelect} />);

    expect(screen.getByText("A-01")).toBeInTheDocument();
    expect(screen.getByText("B-01")).toBeInTheDocument();
    expect(screen.getByText("C-01")).toBeInTheDocument();
  });

  it("사이트 타입 라벨을 표시함", () => {
    render(<SiteSelector sites={mockSites} onSelect={mockOnSelect} />);

    expect(screen.getByText("카라반")).toBeInTheDocument();
    expect(screen.getByText("글램핑")).toBeInTheDocument();
    expect(screen.getByText("캐빈")).toBeInTheDocument();
  });

  it("최대 인원을 표시함", () => {
    render(<SiteSelector sites={mockSites} onSelect={mockOnSelect} />);

    expect(screen.getByText("최대 4명")).toBeInTheDocument();
    expect(screen.getByText("최대 6명")).toBeInTheDocument();
    expect(screen.getByText("최대 5명")).toBeInTheDocument();
  });

  it("가격을 올바르게 포맷하여 표시함", () => {
    render(<SiteSelector sites={mockSites} onSelect={mockOnSelect} />);

    expect(screen.getByText("₩50,000")).toBeInTheDocument();
    expect(screen.getByText("₩80,000")).toBeInTheDocument();
    expect(screen.getByText("₩60,000")).toBeInTheDocument();
  });

  it("사용 불가 사이트를 표시함", () => {
    render(<SiteSelector sites={mockSites} onSelect={mockOnSelect} />);

    expect(screen.getByText("예약 불가")).toBeInTheDocument();
  });

  it("사이트 클릭 시 onSelect 콜백 호출", async () => {
    const user = userEvent.setup();

    render(<SiteSelector sites={mockSites} onSelect={mockOnSelect} />);

    const siteButton = screen.getByText("A-01").closest("button");
    await user.click(siteButton!);

    expect(mockOnSelect).toHaveBeenCalledWith(1);
  });

  it("사용 불가 사이트는 클릭해도 onSelect가 호출되지 않음", async () => {
    const user = userEvent.setup();

    render(<SiteSelector sites={mockSites} onSelect={mockOnSelect} />);

    const disabledButton = screen.getByText("C-01").closest("button");
    await user.click(disabledButton!);

    expect(mockOnSelect).not.toHaveBeenCalled();
  });

  it("사용 불가 사이트 버튼이 비활성화됨", () => {
    render(<SiteSelector sites={mockSites} onSelect={mockOnSelect} />);

    const disabledButton = screen.getByText("C-01").closest("button");
    expect(disabledButton).toBeDisabled();
  });

  it("선택된 사이트를 하이라이트함", () => {
    render(
      <SiteSelector sites={mockSites} selected={1} onSelect={mockOnSelect} />
    );

    const selectedButton = screen.getByText("A-01").closest("button");
    expect(selectedButton).toHaveClass("border-primary");
  });

  it("선택되지 않은 사이트는 기본 스타일", () => {
    render(
      <SiteSelector sites={mockSites} selected={1} onSelect={mockOnSelect} />
    );

    const unselectedButton = screen.getByText("B-01").closest("button");
    expect(unselectedButton).toHaveClass("border-neutral-200");
  });

  it("라디오 버튼이 선택 상태를 표시함", () => {
    const { container } = render(
      <SiteSelector sites={mockSites} selected={1} onSelect={mockOnSelect} />
    );

    const radioButtons = container.querySelectorAll(".rounded-full.border-2");
    const selectedRadio = radioButtons[0]; // 첫 번째 사이트가 선택됨

    expect(selectedRadio).toHaveClass("border-primary");
    if (selectedRadio) {
      expect(selectedRadio.querySelector(".bg-primary")).toBeInTheDocument();
    }
  });

  it("커스텀 className을 적용함", () => {
    const { container } = render(
      <SiteSelector
        sites={mockSites}
        onSelect={mockOnSelect}
        className="custom-class"
      />
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });
});
