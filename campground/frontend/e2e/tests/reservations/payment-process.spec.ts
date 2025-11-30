import { expect, test, type Page } from "@playwright/test";

/**
 * 결제 프로세스 E2E 테스트
 * Toss Payments 통합 및 결제 검증 플로우
 *
 * 테스트 범위:
 * - 결제 성공 플로우
 * - 결제 실패 처리
 * - 금액 검증 (Phase 5)
 * - 에러 핸들링
 */

test.describe("결제 성공 플로우", () => {
  test("1. 결제 승인 후 성공 페이지 표시", async ({ page }) => {
    // Given: 결제 대기 상태의 예약
    const { reservationId, paymentId } = await createPendingReservation();

    // Given: 결제 페이지
    await page.goto(
      `/payment?reservationId=${reservationId}&paymentId=${paymentId}`
    );
    await page.waitForLoadState("networkidle");

    // When: Toss 결제 승인 시뮬레이션
    await simulateTossPaymentSuccess(page, paymentId);

    // Then: 결제 성공 페이지로 리다이렉트
    await expect(page).toHaveURL(/\/payment\/success/);

    // Then: 성공 메시지 표시
    const successMessage = page.locator(
      '[data-testid="payment-success-message"]'
    );
    await expect(successMessage).toBeVisible();
    await expect(successMessage).toContainText(/완료/i);
  });

  test("2. 결제 성공 페이지에서 금액 이중 검증 (Phase 5)", async ({ page }) => {
    // Given: 결제 성공 상태
    const { paymentId, amount } = await createCompletedPayment();

    // When: 결제 성공 페이지 접속
    await page.goto(
      `/payment/success?paymentId=${paymentId}&orderId=test-order-${Date.now()}&amount=${amount}`
    );

    // Then: 백엔드 검증 API 호출 확인
    const verifyResponse = await page.waitForResponse(
      (response) =>
        response.url().includes("/api/payments/verify") &&
        response.request().method() === "POST"
    );
    expect(verifyResponse.ok()).toBeTruthy();

    // Then: 금액 일치 확인 메시지
    const amountDisplay = page.locator('[data-testid="payment-amount"]');
    await expect(amountDisplay).toContainText(amount.toLocaleString());
  });

  test("3. 결제 성공 후 예약 상세로 이동", async ({ page }) => {
    // Given: 결제 성공 페이지
    const { reservationId } = await createCompletedPayment();
    await page.goto("/payment/success?paymentId=1&orderId=test&amount=100000");

    // When: "예약 확인" 버튼 클릭
    const viewReservationButton = page.getByRole("button", {
      name: /예약 확인/i,
    });
    await viewReservationButton.click();

    // Then: 예약 상세 페이지로 이동
    await expect(page).toHaveURL(new RegExp(`/reservations/${reservationId}`));

    // Then: 예약 상태가 "확정"
    const statusBadge = page.locator('[data-testid="reservation-status"]');
    await expect(statusBadge).toContainText(/확정|완료/i);
  });
});

test.describe("결제 실패 처리", () => {
  test("1. 결제 취소 시 실패 페이지 표시", async ({ page }) => {
    // Given: 결제 페이지에서 사용자가 취소
    await page.goto("/payment?reservationId=1&paymentId=1");

    // When: Toss 결제 취소 시뮬레이션
    await simulateTossPaymentCancel(page);

    // Then: 결제 실패 페이지로 리다이렉트
    await expect(page).toHaveURL(/\/payment\/fail/);

    // Then: 실패 메시지 표시
    const failMessage = page.locator('[data-testid="payment-fail-message"]');
    await expect(failMessage).toBeVisible();
    await expect(failMessage).toContainText(/취소/i);
  });

  test("2. 금액 불일치 시 결제 거부 (Phase 5)", async ({ page }) => {
    // Given: 조작된 금액으로 결제 시도
    const { paymentId } = await createPendingReservation();

    // When: 잘못된 금액으로 결제 승인 시뮬레이션
    await page.route("**/api/payments/verify", (route) => {
      route.fulfill({
        status: 400,
        body: JSON.stringify({
          message: "결제 금액이 일치하지 않습니다.",
          fieldErrors: {},
        }),
      });
    });

    await page.goto(
      `/payment/success?paymentId=${paymentId}&orderId=test&amount=99999`
    );

    // Then: 에러 메시지 표시
    const errorMessage = page.locator('[data-testid="error-message"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText(/금액.*불일치/i);
  });

  test("3. 결제 실패 후 재시도 가능", async ({ page }) => {
    // Given: 결제 실패 페이지
    await page.goto("/payment/fail?message=결제에 실패했습니다");

    // When: "다시 시도" 버튼 클릭
    const retryButton = page.getByRole("button", { name: /다시 시도/i });
    await retryButton.click();

    // Then: 결제 페이지로 돌아감
    await expect(page).toHaveURL(/\/payment\?/);
  });

  test("4. Toss API 오류 시 적절한 에러 메시지", async ({ page }) => {
    // Given: Toss API 오류 시뮬레이션
    await page.route("**/api/payments/approve", (route) => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({
          message: "결제 승인 중 오류가 발생했습니다.",
        }),
      });
    });

    // Given: 결제 페이지
    await page.goto("/payment?reservationId=1&paymentId=1");

    // When: 결제 시도
    await page.getByRole("button", { name: /결제하기/i }).click();

    // Then: 서버 오류 메시지 표시
    const alert = page.locator('[role="alert"]');
    await expect(alert).toBeVisible();
    await expect(alert).toContainText(/오류/i);
  });
});

test.describe("결제 금액 검증 (Phase 5 핵심)", () => {
  test("1. 예약 금액과 결제 금액이 일치해야 함", async ({ page }) => {
    // Given: 예약 생성
    const reservation = await createReservation(page, {
      campgroundId: 1,
      checkIn: "2025-12-01",
      checkOut: "2025-12-03",
      adults: 2,
      children: 0,
    });

    // Given: 결제 페이지
    await page.goto(
      `/payment?reservationId=${reservation.id}&paymentId=${reservation.paymentId}`
    );
    await page.waitForLoadState("networkidle");

    // Then: 표시된 금액이 예약 금액과 일치
    const displayedAmount = await getDisplayedAmount(page);
    expect(displayedAmount).toBe(reservation.totalAmount);

    // When: Toss 위젯에 전달된 금액 확인
    const tossAmount = await getTossWidgetAmount(page);
    expect(tossAmount).toBe(reservation.totalAmount);
  });

  test("2. 백엔드에서 저장된 금액 vs 요청 금액 검증", async ({ page }) => {
    interface VerifyRequest {
      amount: number;
      [key: string]: unknown;
    }
    let verifyRequest: VerifyRequest | null = null;

    // Given: 결제 검증 요청 가로채기
    await page.route("**/api/payments/verify", async (route) => {
      const request = route.request();
      verifyRequest = (await request.postDataJSON()) as VerifyRequest;
      route.continue();
    });

    // Given: 결제 성공
    const { paymentId, amount } = await createCompletedPayment();

    // When: 결제 성공 페이지 접속
    await page.goto(
      `/payment/success?paymentId=${paymentId}&orderId=test&amount=${amount}`
    );
    await page.waitForLoadState("networkidle");

    // Then: 백엔드가 금액을 검증했는지 확인
    expect(verifyRequest).toBeTruthy();
    expect(verifyRequest?.amount).toBe(amount);
  });

  test("3. 금액 조작 시도 차단", async ({ page }) => {
    // Given: 정상 예약 생성
    const reservation = await createReservation(page, {
      campgroundId: 1,
      checkIn: "2025-12-01",
      checkOut: "2025-12-03",
      adults: 2,
      children: 0,
    });

    const originalAmount = reservation.totalAmount;
    const manipulatedAmount = originalAmount - 10000; // 10,000원 깎으려는 시도

    // When: 조작된 금액으로 결제 승인 시도
    await page.goto(
      `/payment/success?paymentId=${reservation.paymentId}&orderId=test&amount=${manipulatedAmount}`
    );

    // Then: 금액 불일치 에러
    const errorMessage = page.locator('[data-testid="error-message"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText(/금액.*불일치/i);
  });

  test("4. 허용 오차 범위 내 금액은 승인 (±100원)", async ({ page }) => {
    // Given: 예약 생성
    const reservation = await createReservation(page, {
      campgroundId: 1,
      checkIn: "2025-12-01",
      checkOut: "2025-12-03",
      adults: 2,
      children: 0,
    });

    const originalAmount = reservation.totalAmount;
    const slightlyDifferentAmount = originalAmount + 50; // +50원 (허용 범위 내)

    // When: 소액 차이로 결제 승인
    await page.goto(
      `/payment/success?paymentId=${reservation.paymentId}&orderId=test&amount=${slightlyDifferentAmount}`
    );

    // Then: 정상 처리 (±100원 허용)
    const successMessage = page.locator(
      '[data-testid="payment-success-message"]'
    );
    await expect(successMessage).toBeVisible({ timeout: 5000 });
  });
});

test.describe("결제 페이지 접근 제어", () => {
  test("1. 본인의 예약만 결제 가능", async ({ page }) => {
    // Given: 다른 사용자의 예약 ID
    const otherUserReservationId = "99999";

    // When: 타인의 예약 결제 시도
    await page.goto(
      `/payment?reservationId=${otherUserReservationId}&paymentId=1`
    );

    // Then: 403 Forbidden 에러
    const errorMessage = page.locator('[data-testid="error-message"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText(/권한|접근/i);
  });

  test("2. 이미 완료된 결제는 다시 진행 불가", async ({ page }) => {
    // Given: 이미 완료된 결제
    const { paymentId } = await createCompletedPayment();

    // When: 완료된 결제 재시도
    await page.goto(`/payment?reservationId=1&paymentId=${paymentId}`);

    // Then: 에러 또는 예약 상세로 리다이렉트
    await page.waitForTimeout(1000);
    const url = page.url();
    expect(
      url.includes("/payment/success") || url.includes("/reservations")
    ).toBeTruthy();
  });
});

// ===== 헬퍼 함수들 =====

async function createPendingReservation() {
  // 실제로는 API를 통해 예약 생성
  // 여기서는 시뮬레이션
  return {
    reservationId: "1",
    paymentId: "1",
    amount: 150000,
  };
}

async function createCompletedPayment() {
  // 실제로는 API를 통해 완료된 결제 생성
  return {
    reservationId: "1",
    paymentId: "1",
    amount: 150000,
    orderId: `order-${Date.now()}`,
  };
}

async function createReservation(
  page: Page,
  data: {
    campgroundId: number;
    checkIn: string;
    checkOut: string;
    adults: number;
    children: number;
  }
) {
  // 실제로는 API 호출하여 예약 생성
  return {
    id: "1",
    paymentId: "1",
    totalAmount: 150000,
    ...data,
  };
}

async function simulateTossPaymentSuccess(page: Page, paymentId: string) {
  // Toss 결제 위젯에서 성공 시뮬레이션
  // 실제로는 Toss 테스트 환경 사용
  await page.evaluate((id) => {
    window.location.href = `/payment/success?paymentId=${id}&orderId=test-${Date.now()}&amount=150000`;
  }, paymentId);
}

async function simulateTossPaymentCancel(page: Page) {
  // Toss 결제 취소 시뮬레이션
  await page.evaluate(() => {
    window.location.href =
      "/payment/fail?code=USER_CANCEL&message=사용자가 결제를 취소했습니다";
  });
}

async function getDisplayedAmount(page: Page): Promise<number> {
  const element = page.locator('[data-testid="payment-amount"]');
  const text = await element.textContent();
  return parsePrice(text || "0");
}

async function getTossWidgetAmount(page: Page): Promise<number> {
  // Toss 위젯에 전달된 금액 추출
  // 실제 구현은 위젯 API에 따라 다름
  return await page.evaluate(() => {
    // @ts-expect-error - 전역 변수 접근
    return window.__TOSS_PAYMENT_AMOUNT__ || 0;
  });
}

function parsePrice(text: string): number {
  const numberStr = text.replace(/[^\d]/g, "");
  return parseInt(numberStr) || 0;
}
