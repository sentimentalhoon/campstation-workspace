/**
 * 예약 생성 플로우 통합 테스트
 *
 * 사용자 시나리오:
 * 1. 캠핑장 상세 페이지에서 "예약하기" 버튼 클릭
 * 2. 날짜 선택 (체크인/체크아웃)
 * 3. 사이트 선택
 * 4. 인원 선택 (성인/어린이)
 * 5. 예약 정보 확인
 * 6. 예약 생성 API 호출
 * 7. 결제 페이지로 이동
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    back: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn((key) => {
      if (key === "campgroundId") return "1";
      return null;
    }),
  }),
}));

// Mock APIs
vi.mock("@/lib/api/campgrounds", () => ({
  campgroundApi: {
    getById: vi.fn(),
    getSites: vi.fn(),
  },
}));

vi.mock("@/lib/api/reservations", () => ({
  reservationApi: {
    create: vi.fn(),
  },
}));

describe("예약 생성 플로우 통합 테스트", () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  // Mock 데이터
  const mockCampground = {
    id: 1,
    name: "테스트 캠핑장",
    description: "좋은 캠핑장입니다",
    address: "서울시 강남구",
    rating: 4.5,
    reviewCount: 100,
    thumbnailUrls: ["https://example.com/image.jpg"],
  };

  const mockSites = {
    success: true,
    data: {
      content: [
        {
          id: 1,
          siteNumber: "A-01",
          type: "STANDARD",
          capacity: 4,
          basePrice: 50000,
          available: true,
        },
        {
          id: 2,
          siteNumber: "A-02",
          type: "DELUXE",
          capacity: 6,
          basePrice: 80000,
          available: true,
        },
      ],
      totalElements: 2,
    },
    timestamp: new Date().toISOString(),
  };

  it("사용자가 예약 프로세스를 완료할 수 있다", async () => {
    const user = userEvent.setup();

    // Mock API 설정
    const { campgroundApi } = await import("@/lib/api/campgrounds");
    const { reservationApi } = await import("@/lib/api/reservations");

    vi.mocked(campgroundApi.getById).mockResolvedValue({
      success: true,
      data: mockCampground,
      timestamp: new Date().toISOString(),
    });

    vi.mocked(campgroundApi.getSites).mockResolvedValue(mockSites);

    vi.mocked(reservationApi.create).mockResolvedValue({
      success: true,
      data: {
        id: 123,
        campgroundId: 1,
        campgroundName: "테스트 캠핑장",
        siteId: 1,
        siteNumber: "A-01",
        checkInDate: "2025-12-01",
        checkOutDate: "2025-12-03",
        adults: 2,
        children: 1,
        totalAmount: 100000,
        status: "PENDING",
        createdAt: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    });

    // 예약 페이지 렌더링 (동적 import 필요)
    const ReservationNewPage = (await import("@/app/reservations/new/page"))
      .default;

    render(
      <QueryClientProvider client={queryClient}>
        <ReservationNewPage />
      </QueryClientProvider>
    );

    // Step 1: 날짜 선택 대기
    await waitFor(() => {
      expect(screen.getByText(/날짜 선택/i)).toBeInTheDocument();
    });

    // 날짜 선택 (간단한 시뮬레이션)
    const checkInInput = screen.getByLabelText(/체크인/i);
    const checkOutInput = screen.getByLabelText(/체크아웃/i);

    await user.type(checkInInput, "2025-12-01");
    await user.type(checkOutInput, "2025-12-03");

    // 다음 단계 버튼 클릭
    const nextButton = screen.getByRole("button", { name: /다음/i });
    await user.click(nextButton);

    // Step 2: 사이트 선택
    await waitFor(() => {
      expect(screen.getByText(/사이트 선택/i)).toBeInTheDocument();
    });

    // 첫 번째 사이트 선택
    const siteCard = screen.getByText("A-01").closest("div");
    if (siteCard) {
      await user.click(siteCard);
    }

    await user.click(nextButton);

    // Step 3: 인원 선택
    await waitFor(() => {
      expect(screen.getByText(/인원 선택/i)).toBeInTheDocument();
    });

    // 성인 +1, 어린이 +1
    const adultPlusButton = within(
      screen.getByText(/성인/i).closest("div")!
    ).getByRole("button", { name: "+" });
    const childPlusButton = within(
      screen.getByText(/어린이/i).closest("div")!
    ).getByRole("button", { name: "+" });

    await user.click(adultPlusButton);
    await user.click(adultPlusButton); // 성인 2명
    await user.click(childPlusButton); // 어린이 1명

    // 예약하기 버튼 클릭
    const reserveButton = screen.getByRole("button", { name: /예약하기/i });
    await user.click(reserveButton);

    // API 호출 확인
    await waitFor(() => {
      expect(reservationApi.create).toHaveBeenCalledWith({
        campgroundId: 1,
        siteId: 1,
        checkInDate: "2025-12-01",
        checkOutDate: "2025-12-03",
        adults: 2,
        children: 1,
      });
    });

    // 결제 페이지로 리다이렉트 확인
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining("/payment?reservationId=123")
      );
    });
  });

  it("사이트가 선택되지 않으면 다음 단계로 진행할 수 없다", async () => {
    const user = userEvent.setup();

    const { campgroundApi } = await import("@/lib/api/campgrounds");
    vi.mocked(campgroundApi.getSites).mockResolvedValue(mockSites);

    const ReservationNewPage = (await import("@/app/reservations/new/page"))
      .default;

    render(
      <QueryClientProvider client={queryClient}>
        <ReservationNewPage />
      </QueryClientProvider>
    );

    // 날짜만 선택하고 사이트 선택하지 않음
    await waitFor(() => {
      expect(screen.getByText(/날짜 선택/i)).toBeInTheDocument();
    });

    const nextButton = screen.getByRole("button", { name: /다음/i });

    // 사이트 선택 단계로 이동
    await user.click(nextButton);

    // 사이트 선택 없이 다음 버튼 클릭 시도
    await waitFor(() => {
      expect(screen.getByText(/사이트 선택/i)).toBeInTheDocument();
    });

    // 다음 버튼이 비활성화되어야 함
    expect(nextButton).toBeDisabled();
  });

  it("최소 인원(성인 1명) 미만일 경우 예약할 수 없다", async () => {
    const ReservationNewPage = (await import("@/app/reservations/new/page"))
      .default;

    render(
      <QueryClientProvider client={queryClient}>
        <ReservationNewPage />
      </QueryClientProvider>
    );

    // 인원 선택 단계까지 진행
    await waitFor(() => {
      expect(screen.getByText(/인원 선택/i)).toBeInTheDocument();
    });

    const reserveButton = screen.getByRole("button", { name: /예약하기/i });

    // 성인 0명일 때 예약 버튼 비활성화 확인
    expect(reserveButton).toBeDisabled();
  });
});
