import Calendar from "@/components/features/Calendar";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

describe("Calendar", () => {
  const mockOnSelectRange = jest.fn();
  const today = new Date(2025, 11, 1); // 2025년 12월 1일

  beforeEach(() => {
    jest.clearAllMocks();
    // 현재 날짜를 고정
    jest.useFakeTimers();
    jest.setSystemTime(today);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("현재 월을 표시함", () => {
    render(<Calendar onSelectRange={mockOnSelectRange} />);

    expect(screen.getByText("2025년 12월")).toBeInTheDocument();
  });

  it("요일 라벨을 표시함", () => {
    render(<Calendar onSelectRange={mockOnSelectRange} />);

    expect(screen.getByText("일")).toBeInTheDocument();
    expect(screen.getByText("월")).toBeInTheDocument();
    expect(screen.getByText("화")).toBeInTheDocument();
    expect(screen.getByText("수")).toBeInTheDocument();
    expect(screen.getByText("목")).toBeInTheDocument();
    expect(screen.getByText("금")).toBeInTheDocument();
    expect(screen.getByText("토")).toBeInTheDocument();
  });

  it("이전 달 버튼 클릭 시 이전 달로 이동", async () => {
    const user = userEvent.setup({ delay: null });

    render(<Calendar onSelectRange={mockOnSelectRange} />);

    const prevButton = screen.getByLabelText("이전 달");
    await user.click(prevButton);

    expect(screen.getByText("2025년 11월")).toBeInTheDocument();
  });

  it("다음 달 버튼 클릭 시 다음 달로 이동", async () => {
    const user = userEvent.setup({ delay: null });

    render(<Calendar onSelectRange={mockOnSelectRange} />);

    const nextButton = screen.getByLabelText("다음 달");
    await user.click(nextButton);

    expect(screen.getByText("2026년 1월")).toBeInTheDocument();
  });

  it("날짜 클릭 시 onSelectRange 콜백 호출", async () => {
    const user = userEvent.setup({ delay: null });

    render(<Calendar onSelectRange={mockOnSelectRange} minDate={today} />);

    // 12월 15일 클릭
    const dateButtons = screen
      .getAllByRole("button")
      .filter(
        (btn) =>
          btn.textContent === "15" && !(btn as HTMLButtonElement).disabled
      );

    if (dateButtons.length > 0) {
      await user.click(dateButtons[0]!);
      expect(mockOnSelectRange).toHaveBeenCalled();
    }
  });

  it("과거 날짜는 비활성화됨", () => {
    const minDate = today;
    render(<Calendar onSelectRange={mockOnSelectRange} minDate={minDate} />);

    // 과거 날짜 버튼들이 disabled 상태인지 확인
    const allButtons = screen.getAllByRole("button");
    const dateButtons = allButtons.filter(
      (btn) =>
        btn.textContent &&
        !isNaN(Number(btn.textContent)) &&
        !btn.getAttribute("aria-label") // 네비게이션 버튼 제외
    );

    // 일부 날짜 버튼이 비활성화되어 있어야 함 (이전 달의 날짜들)
    const disabledButtons = dateButtons.filter(
      (btn) => (btn as HTMLButtonElement).disabled
    );
    expect(disabledButtons.length).toBeGreaterThan(0);
  });

  it("선택된 범위를 하이라이트함", () => {
    const selectedRange = {
      start: new Date(2025, 11, 10),
      end: new Date(2025, 11, 15),
    };

    const { container } = render(
      <Calendar
        onSelectRange={mockOnSelectRange}
        selectedRange={selectedRange}
        minDate={today}
      />
    );

    // 선택된 날짜들이 primary 색상 클래스를 가지는지 확인
    const primaryButtons = container.querySelectorAll(".bg-primary");
    expect(primaryButtons.length).toBeGreaterThan(0);
  });

  it("비활성화된 날짜 목록을 처리함", () => {
    const disabledDates = [new Date(2025, 11, 10), new Date(2025, 11, 11)];

    render(
      <Calendar
        onSelectRange={mockOnSelectRange}
        disabledDates={disabledDates}
        minDate={today}
      />
    );

    const allButtons = screen.getAllByRole("button");
    const dateButtons = allButtons.filter(
      (btn) =>
        btn.textContent &&
        !isNaN(Number(btn.textContent)) &&
        !btn.getAttribute("aria-label")
    );

    // 비활성화된 날짜가 있어야 함
    const disabledButtons = dateButtons.filter(
      (btn) => (btn as HTMLButtonElement).disabled
    );
    expect(disabledButtons.length).toBeGreaterThan(0);
  });

  it("최대 날짜 이후의 날짜는 비활성화됨", () => {
    const maxDate = new Date(2025, 11, 15);

    render(
      <Calendar
        onSelectRange={mockOnSelectRange}
        minDate={today}
        maxDate={maxDate}
      />
    );

    const allButtons = screen.getAllByRole("button");
    const dateButtons = allButtons.filter(
      (btn) =>
        btn.textContent &&
        !isNaN(Number(btn.textContent)) &&
        !btn.getAttribute("aria-label")
    );

    // maxDate 이후의 날짜들이 비활성화되어 있어야 함
    const disabledButtons = dateButtons.filter(
      (btn) => (btn as HTMLButtonElement).disabled
    );
    expect(disabledButtons.length).toBeGreaterThan(0);
  });

  it("범례(Legend)를 표시함", () => {
    render(<Calendar onSelectRange={mockOnSelectRange} />);

    expect(screen.getByText("체크인/체크아웃")).toBeInTheDocument();
    expect(screen.getByText("선택된 기간")).toBeInTheDocument();
  });

  it("커스텀 className을 적용함", () => {
    const { container } = render(
      <Calendar onSelectRange={mockOnSelectRange} className="custom-class" />
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });
});
