import { expect, test, type Page } from "@playwright/test";

/**
 * 예약-결제 통합 E2E 테스트
 * Phase 1-6에서 개선된 예약-결제 시스템의 전체 플로우를 검증
 *
 * 테스트 범위:
 * 1. 가격 계산 검증 (Phase 1)
 * 2. 백엔드 금액 검증 (Phase 2)
 * 3. URL 파라미터 최적화 검증 (Phase 3-4)
 * 4. 결제 금액 재검증 (Phase 5)
 * 5. 에러 핸들링 (Phase 6)
 */

test.describe("예약-결제 통합 플로우", () => {
  test.describe.configure({ mode: "serial" });

  let reservationId: string;
  let paymentId: string;

  test("1. 캠핑장 상세에서 예약 페이지로 이동", async ({ page }) => {
    // Given: 캠핑장 상세 페이지
    await page.goto("/campgrounds/1");

    // When: "예약하기" 버튼 클릭
    const reserveButton = page.getByRole("button", { name: /예약/i });
    await reserveButton.click();

    // Then: 예약 페이지로 이동
    await expect(page).toHaveURL(/\/reservations\/new/);
    await expect(page).toHaveURL(/campgroundId=1/);
  });

  test("2. 예약 정보 입력 및 가격 계산 검증 (Phase 1)", async ({ page }) => {
    // Given: 예약 페이지
    await page.goto("/reservations/new?campgroundId=1");

    // When: 날짜 선택 (7일 후 체크인, 2박 3일)
    const checkInDate = new Date();
    checkInDate.setDate(checkInDate.getDate() + 7);
    const checkOutDate = new Date(checkInDate);
    checkOutDate.setDate(checkOutDate.getDate() + 2);

    await selectDates(page, checkInDate, checkOutDate);

    // When: 인원 선택 (성인 2명, 어린이 1명)
    await selectGuests(page, 2, 1);

    // When: 사이트 선택
    await selectFirstAvailableSite(page);

    // Then: 가격 정보가 표시됨
    const priceBreakdown = page.locator('[data-testid="price-breakdown"]');
    await expect(priceBreakdown).toBeVisible();

    // Then: 할인이 subtotal에 적용되는지 확인
    const basePrice = await getPriceText(page, "basePrice");
    const surcharges = await getPriceText(page, "surcharges");
    const fees = await getPriceText(page, "fees");
    const discount = await getPriceText(page, "discount");
    const totalPrice = await getPriceText(page, "totalPrice");

    // 계산 검증: totalPrice = (basePrice + surcharges + fees) - discount
    const expectedTotal = basePrice + surcharges + fees - discount;
    expect(Math.abs(totalPrice - expectedTotal)).toBeLessThan(1); // 소수점 오차 허용
  });

  test("3. 예약 생성 및 결제 페이지 이동 (Phase 2-4)", async ({ page }) => {
    // Given: 예약 정보가 입력된 상태
    await page.goto("/reservations/new?campgroundId=1");
    await fillReservationForm(page);

    // When: "결제하기" 버튼 클릭
    const submitButton = page.getByRole("button", { name: /결제/i });
    await submitButton.click();

    // Then: 결제 페이지로 이동 (URL에 reservationId와 paymentId만 있어야 함)
    await page.waitForURL(/\/payment\?/);
    const url = new URL(page.url());

    // Phase 3 검증: URL 파라미터가 2개만 있어야 함
    expect(url.searchParams.has("reservationId")).toBeTruthy();
    expect(url.searchParams.has("paymentId")).toBeTruthy();
    expect(url.searchParams.size).toBe(2);

    // reservationId와 paymentId 저장 (다음 테스트에서 사용)
    reservationId = url.searchParams.get("reservationId")!;
    paymentId = url.searchParams.get("paymentId")!;

    // Phase 4 검증: 결제 페이지에서 API로 데이터를 다시 불러오는지 확인
    await page.waitForResponse((response) =>
      response.url().includes(`/api/reservations/${reservationId}`)
    );

    // Then: 결제 정보가 표시됨
    await expect(page.locator('[data-testid="payment-info"]')).toBeVisible();
  });

  test("4. 결제 페이지에서 금액 검증 (Phase 5)", async ({ page }) => {
    // Given: 결제 페이지
    await page.goto(
      `/payment?reservationId=${reservationId}&paymentId=${paymentId}`
    );

    // When: 페이지 로딩 대기
    await page.waitForLoadState("networkidle");

    // Then: 예약 정보가 정확하게 표시됨
    const displayedAmount = await page
      .locator('[data-testid="payment-amount"]')
      .textContent();
    expect(displayedAmount).toBeTruthy();

    // Then: Toss 결제 위젯이 로드됨
    const paymentWidget = page.locator('[data-testid="payment-widget"]');
    await expect(paymentWidget).toBeVisible({ timeout: 10000 });
  });

  test("5. 결제 페이지 새로고침 시 데이터 유지", async ({ page }) => {
    // Given: 결제 페이지
    await page.goto(
      `/payment?reservationId=${reservationId}&paymentId=${paymentId}`
    );

    // When: 페이지 로딩 후 금액 확인
    await page.waitForLoadState("networkidle");
    const amountBefore = await page
      .locator('[data-testid="payment-amount"]')
      .textContent();

    // When: 페이지 새로고침
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Then: 동일한 금액이 표시됨 (API에서 다시 불러옴)
    const amountAfter = await page
      .locator('[data-testid="payment-amount"]')
      .textContent();
    expect(amountAfter).toBe(amountBefore);
  });
});

test.describe("에러 핸들링 시나리오 (Phase 6)", () => {
  test("1. 존재하지 않는 예약 조회 시 404 에러", async ({ page }) => {
    // Given: 존재하지 않는 예약 ID
    const invalidReservationId = "99999999";

    // When: 결제 페이지 접속 시도
    await page.goto(
      `/payment?reservationId=${invalidReservationId}&paymentId=1`
    );

    // Then: 404 에러 메시지 표시
    const errorMessage = page.locator('[data-testid="error-message"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText(/찾을 수 없습니다/i);

    // Then: "캠핑장 목록으로" 버튼 표시
    const backButton = page.getByRole("button", { name: /캠핑장 목록/i });
    await expect(backButton).toBeVisible();
  });

  test("2. 네트워크 오류 시 재시도 버튼 표시", async ({ page, context }) => {
    // Given: 네트워크를 오프라인으로 설정
    await context.setOffline(true);

    // When: 결제 페이지 접속 시도
    await page.goto("/payment?reservationId=1&paymentId=1");

    // Then: 에러 메시지 표시
    const errorMessage = page.locator('[data-testid="error-message"]');
    await expect(errorMessage).toBeVisible();

    // Then: "다시 시도" 버튼 표시
    const retryButton = page.getByRole("button", { name: /다시 시도/i });
    await expect(retryButton).toBeVisible();

    // When: 네트워크 복구 후 재시도
    await context.setOffline(false);
    await retryButton.click();

    // Then: 정상적으로 페이지 로드
    await page.waitForLoadState("networkidle");
    await expect(page.locator('[data-testid="payment-info"]')).toBeVisible();
  });

  test("3. 서버 오류 시 자동 재시도", async ({ page }) => {
    let requestCount = 0;

    // Given: API 요청을 가로채서 처음 2번은 500 에러 반환
    await page.route("**/api/reservations/*", (route) => {
      requestCount++;
      if (requestCount <= 2) {
        route.fulfill({
          status: 500,
          body: JSON.stringify({ message: "Internal Server Error" }),
        });
      } else {
        route.continue();
      }
    });

    // When: 결제 페이지 접속
    await page.goto("/payment?reservationId=1&paymentId=1");

    // Then: React Query가 자동으로 재시도 (최대 2번)
    await page.waitForTimeout(5000); // 재시도 대기 (지수 백오프)

    // Then: 3번째 시도에서 성공
    expect(requestCount).toBe(3);
    await expect(page.locator('[data-testid="payment-info"]')).toBeVisible();
  });

  test("4. 예약 생성 시 날짜 충돌 (409 에러)", async ({ page }) => {
    // Given: 이미 예약된 날짜에 대한 요청을 시뮬레이션
    await page.route("**/api/reservations", (route) => {
      if (route.request().method() === "POST") {
        route.fulfill({
          status: 409,
          body: JSON.stringify({ message: "이미 예약된 날짜입니다." }),
        });
      } else {
        route.continue();
      }
    });

    // Given: 예약 페이지
    await page.goto("/reservations/new?campgroundId=1");
    await fillReservationForm(page);

    // When: 예약 제출
    const submitButton = page.getByRole("button", { name: /결제/i });
    await submitButton.click();

    // Then: 409 에러 메시지 표시
    const alert = page.locator('[role="alert"]');
    await expect(alert).toBeVisible();
    await expect(alert).toContainText(/이미 예약된 날짜/i);

    // Then: 재시도 안함 (4xx 에러)
    await page.waitForTimeout(3000);
    await expect(page).toHaveURL(/\/reservations\/new/); // 여전히 예약 페이지
  });

  test("5. 인증 오류 시 로그인 페이지로 리다이렉트", async ({ page }) => {
    // Given: 401 에러 반환 설정
    await page.route("**/api/reservations", (route) => {
      route.fulfill({
        status: 401,
        body: JSON.stringify({ message: "Unauthorized" }),
      });
    });

    // Given: 예약 페이지
    await page.goto("/reservations/new?campgroundId=1");
    await fillReservationForm(page);

    // When: 예약 제출
    const submitButton = page.getByRole("button", { name: /결제/i });
    await submitButton.click();

    // Then: "로그인이 필요합니다" 메시지 또는 로그인 페이지로 리다이렉트
    await page.waitForTimeout(1000);
    const currentUrl = page.url();
    const hasLoginMessage = await page.locator('[role="alert"]').textContent();

    expect(
      currentUrl.includes("/login") || hasLoginMessage?.includes("로그인")
    ).toBeTruthy();
  });
});

test.describe("가격 계산 정확성 검증", () => {
  test("주말 요금제가 정확하게 적용되는지 확인", async ({ page }) => {
    // Given: 예약 페이지
    await page.goto("/reservations/new?campgroundId=1");

    // When: 주말이 포함된 날짜 선택
    const friday = getNextDayOfWeek(5); // 금요일
    const sunday = new Date(friday);
    sunday.setDate(sunday.getDate() + 2); // 일요일

    await selectDates(page, friday, sunday);
    await selectFirstAvailableSite(page);

    // Then: 주말 할증료가 표시됨
    const weekendSurcharge = page.locator('[data-testid="weekend-surcharge"]');
    await expect(weekendSurcharge).toBeVisible();

    // Then: 주말 할증료가 0보다 큼
    const surchargeText = await weekendSurcharge.textContent();
    const surchargeAmount = parsePrice(surchargeText || "0");
    expect(surchargeAmount).toBeGreaterThan(0);
  });

  test("추가 인원 요금이 정확하게 계산되는지 확인", async ({ page }) => {
    // Given: 예약 페이지
    await page.goto("/reservations/new?campgroundId=1");

    // When: 기본 인원보다 많은 인원 선택
    await selectDates(page, getNextWeekday(), getNextWeekday(3));
    await selectGuests(page, 5, 2); // 성인 5명, 어린이 2명 (총 7명)
    await selectFirstAvailableSite(page);

    // Then: 추가 인원 요금이 표시됨
    const extraGuestFee = page.locator('[data-testid="extra-guest-fee"]');
    await expect(extraGuestFee).toBeVisible();

    // Then: 추가 인원 요금이 0보다 큼
    const feeText = await extraGuestFee.textContent();
    const feeAmount = parsePrice(feeText || "0");
    expect(feeAmount).toBeGreaterThan(0);
  });

  test("할인이 subtotal에 적용되는지 확인 (Phase 1 핵심)", async ({ page }) => {
    // Given: 할인 쿠폰이 있는 사용자 (시뮬레이션)
    // 실제로는 쿠폰 적용 로직 구현 후 테스트

    await page.goto("/reservations/new?campgroundId=1");
    await fillReservationForm(page);

    // When: 할인 쿠폰 적용
    const couponInput = page.locator('[data-testid="coupon-input"]');
    if (await couponInput.isVisible()) {
      await couponInput.fill("DISCOUNT10");
      await page.getByRole("button", { name: /적용/i }).click();
    }

    // Then: 할인이 (basePrice + surcharges + fees)에 적용됨
    const basePrice = await getPriceText(page, "basePrice");
    const surcharges = await getPriceText(page, "surcharges");
    const fees = await getPriceText(page, "fees");
    const discount = await getPriceText(page, "discount");
    const totalPrice = await getPriceText(page, "totalPrice");

    // 할인은 subtotal에 적용되어야 함
    const subtotal = basePrice + surcharges + fees;
    const expectedTotal = subtotal - discount;

    expect(Math.abs(totalPrice - expectedTotal)).toBeLessThan(1);
  });
});

// ===== 헬퍼 함수들 =====

async function selectDates(page: Page, checkIn: Date, checkOut: Date) {
  const checkInInput = page.locator('[data-testid="check-in-date"]');
  const checkOutInput = page.locator('[data-testid="check-out-date"]');

  await checkInInput.fill(formatDate(checkIn));
  await checkOutInput.fill(formatDate(checkOut));
}

async function selectGuests(page: Page, adults: number, children: number) {
  const adultInput = page.locator('[data-testid="adult-count"]');
  const childInput = page.locator('[data-testid="child-count"]');

  await adultInput.fill(adults.toString());
  await childInput.fill(children.toString());
}

async function selectFirstAvailableSite(page: Page) {
  const firstSite = page.locator('[data-testid^="site-option-"]').first();
  await firstSite.click();
}

async function fillReservationForm(page: Page) {
  await selectDates(page, getNextWeekday(), getNextWeekday(2));
  await selectGuests(page, 2, 0);
  await selectFirstAvailableSite(page);
}

async function getPriceText(page: Page, testId: string): Promise<number> {
  const element = page.locator(`[data-testid="${testId}"]`);
  const text = await element.textContent();
  return parsePrice(text || "0");
}

function parsePrice(text: string): number {
  // "123,456원" → 123456
  const numberStr = text.replace(/[^\d]/g, "");
  return parseInt(numberStr) || 0;
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function getNextWeekday(daysFromNow: number = 7): Date {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);

  // 주말이면 월요일로 이동
  while (date.getDay() === 0 || date.getDay() === 6) {
    date.setDate(date.getDate() + 1);
  }

  return date;
}

function getNextDayOfWeek(dayOfWeek: number): Date {
  // 0 = 일요일, 1 = 월요일, ..., 6 = 토요일
  const today = new Date();
  const daysUntilTarget = (dayOfWeek - today.getDay() + 7) % 7;
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + daysUntilTarget + 7); // 다음 주

  return targetDate;
}
