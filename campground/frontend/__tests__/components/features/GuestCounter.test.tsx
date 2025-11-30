import GuestCounter from "@/components/features/GuestCounter";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

describe("GuestCounter", () => {
  const mockOnChangeAdults = jest.fn();
  const mockOnChangeChildren = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("초기 값을 렌더링함", () => {
    render(
      <GuestCounter
        adults={2}
        childrenCount={1}
        onChangeAdults={mockOnChangeAdults}
        onChangechildrenCount={mockOnChangeChildren}
      />
    );

    const adultCounters = screen.getAllByText("2");
    const childrenCounters = screen.getAllByText("1");

    expect(adultCounters.length).toBeGreaterThan(0);
    expect(childrenCounters.length).toBeGreaterThan(0);
  });

  it("성인 증가 버튼 클릭 시 콜백 호출", async () => {
    const user = userEvent.setup();

    render(
      <GuestCounter
        adults={2}
        childrenCount={0}
        onChangeAdults={mockOnChangeAdults}
        onChangechildrenCount={mockOnChangeChildren}
        maxGuests={5}
      />
    );

    const buttons = screen.getAllByRole("button");
    const adultIncreaseButton = buttons.find(
      (btn) => btn.getAttribute("aria-label") === "성인 인원 증가"
    );

    await user.click(adultIncreaseButton!);
    expect(mockOnChangeAdults).toHaveBeenCalledWith(3);
  });

  it("성인 감소 버튼 클릭 시 콜백 호출", async () => {
    const user = userEvent.setup();

    render(
      <GuestCounter
        adults={2}
        childrenCount={0}
        onChangeAdults={mockOnChangeAdults}
        onChangechildrenCount={mockOnChangeChildren}
      />
    );

    const buttons = screen.getAllByRole("button");
    const adultDecreaseButton = buttons.find(
      (btn) => btn.getAttribute("aria-label") === "성인 인원 감소"
    );

    await user.click(adultDecreaseButton!);
    expect(mockOnChangeAdults).toHaveBeenCalledWith(1);
  });

  it("성인이 1명일 때 감소 버튼 비활성화", () => {
    render(
      <GuestCounter
        adults={1}
        childrenCount={0}
        onChangeAdults={mockOnChangeAdults}
        onChangechildrenCount={mockOnChangeChildren}
      />
    );

    const buttons = screen.getAllByRole("button");
    const adultDecreaseButton = buttons.find(
      (btn) => btn.getAttribute("aria-label") === "성인 인원 감소"
    );

    expect(adultDecreaseButton).toBeDisabled();
  });

  it("어린이 증가 버튼 클릭 시 콜백 호출", async () => {
    const user = userEvent.setup();

    render(
      <GuestCounter
        adults={2}
        childrenCount={1}
        onChangeAdults={mockOnChangeAdults}
        onChangechildrenCount={mockOnChangeChildren}
        maxGuests={5}
      />
    );

    const buttons = screen.getAllByRole("button");
    const childrenIncreaseButton = buttons.find(
      (btn) => btn.getAttribute("aria-label") === "어린이 인원 증가"
    );

    await user.click(childrenIncreaseButton!);
    expect(mockOnChangeChildren).toHaveBeenCalledWith(2);
  });

  it("어린이 감소 버튼 클릭 시 콜백 호출", async () => {
    const user = userEvent.setup();

    render(
      <GuestCounter
        adults={2}
        childrenCount={1}
        onChangeAdults={mockOnChangeAdults}
        onChangechildrenCount={mockOnChangeChildren}
      />
    );

    const buttons = screen.getAllByRole("button");
    const childrenDecreaseButton = buttons.find(
      (btn) => btn.getAttribute("aria-label") === "어린이 인원 감소"
    );

    await user.click(childrenDecreaseButton!);
    expect(mockOnChangeChildren).toHaveBeenCalledWith(0);
  });

  it("어린이가 0명일 때 감소 버튼 비활성화", () => {
    render(
      <GuestCounter
        adults={2}
        childrenCount={0}
        onChangeAdults={mockOnChangeAdults}
        onChangechildrenCount={mockOnChangeChildren}
      />
    );

    const buttons = screen.getAllByRole("button");
    const childrenDecreaseButton = buttons.find(
      (btn) => btn.getAttribute("aria-label") === "어린이 인원 감소"
    );

    expect(childrenDecreaseButton).toBeDisabled();
  });

  it("최대 인원 도달 시 증가 버튼 비활성화", () => {
    render(
      <GuestCounter
        adults={3}
        childrenCount={2}
        onChangeAdults={mockOnChangeAdults}
        onChangechildrenCount={mockOnChangeChildren}
        maxGuests={5}
      />
    );

    const buttons = screen.getAllByRole("button");
    const adultIncreaseButton = buttons.find(
      (btn) => btn.getAttribute("aria-label") === "성인 인원 증가"
    );
    const childrenIncreaseButton = buttons.find(
      (btn) => btn.getAttribute("aria-label") === "어린이 인원 증가"
    );

    expect(adultIncreaseButton).toBeDisabled();
    expect(childrenIncreaseButton).toBeDisabled();
  });

  it("총 인원과 최대 인원을 표시함", () => {
    render(
      <GuestCounter
        adults={2}
        childrenCount={1}
        onChangeAdults={mockOnChangeAdults}
        onChangechildrenCount={mockOnChangeChildren}
        maxGuests={6}
      />
    );

    expect(screen.getByText(/총 3명/)).toBeInTheDocument();
    expect(screen.getByText(/최대 6명/)).toBeInTheDocument();
  });

  it("성인과 어린이 라벨을 표시함", () => {
    render(
      <GuestCounter
        adults={2}
        childrenCount={1}
        onChangeAdults={mockOnChangeAdults}
        onChangechildrenCount={mockOnChangeChildren}
      />
    );

    expect(screen.getByText("성인")).toBeInTheDocument();
    expect(screen.getByText("어린이")).toBeInTheDocument();
    expect(screen.getByText("만 13세 이상")).toBeInTheDocument();
    expect(screen.getByText("만 12세 이하")).toBeInTheDocument();
  });
});
