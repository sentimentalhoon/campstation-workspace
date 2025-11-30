import { expect, type Locator, type Page } from "@playwright/test";

/**
 * 예약 생성 페이지 객체 모델
 * Page Object Pattern을 사용하여 예약 생성 페이지의 요소와 액션을 캡슐화
 *
 * @see docs/testing/e2e-testing-guide.md - Page Object Model
 * @see docs/specifications/03-PAGES.md - 예약 생성 페이지
 */
export class ReservationNewPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly campgroundInfo: Locator;
  readonly calendar: Locator;
  readonly checkInDateInput: Locator;
  readonly checkOutDateInput: Locator;
  readonly guestCountInput: Locator;
  readonly siteSelect: Locator;
  readonly priceBreakdown: Locator;
  readonly totalPrice: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.locator("h1");
    this.campgroundInfo = page.locator('[data-testid="campground-info"]');
    this.calendar = page.locator('[data-testid="calendar"]');
    this.checkInDateInput = page.getByLabel(/체크인|입실/i);
    this.checkOutDateInput = page.getByLabel(/체크아웃|퇴실/i);
    this.guestCountInput = page.getByLabel(/인원/i);
    this.siteSelect = page.getByLabel(/사이트|구역/i);
    this.priceBreakdown = page.locator('[data-testid="price-breakdown"]');
    this.totalPrice = page.locator('[data-testid="total-price"]');
    this.submitButton = page.getByRole("button", { name: /예약하기|결제/ });
  }

  /**
   * 예약 생성 페이지로 이동
   */
  async goto(campgroundId?: number) {
    const url = campgroundId
      ? `/reservations/new?campgroundId=${campgroundId}`
      : "/reservations/new";
    await this.page.goto(url);
  }

  /**
   * 체크인/체크아웃 날짜 선택
   */
  async selectDates(checkIn: string, checkOut: string) {
    await this.checkInDateInput.fill(checkIn);
    await this.checkOutDateInput.fill(checkOut);
  }

  /**
   * 인원 수 입력
   */
  async selectGuestCount(count: number) {
    await this.guestCountInput.fill(count.toString());
  }

  /**
   * 사이트 선택
   */
  async selectSite(siteName: string) {
    await this.siteSelect.selectOption({ label: siteName });
  }

  /**
   * 예약 제출
   */
  async submit() {
    await this.submitButton.click();
  }

  /**
   * 결제 페이지로 이동했는지 확인
   */
  async expectNavigatedToPayment() {
    await expect(this.page).toHaveURL(/\/payment/);
  }

  /**
   * 총 가격이 표시되는지 확인
   */
  async expectTotalPriceVisible() {
    await expect(this.totalPrice).toBeVisible();
  }
}

/**
 * 예약 상세 페이지 객체 모델
 */
export class ReservationDetailPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly reservationInfo: Locator;
  readonly qrCode: Locator;
  readonly campgroundInfo: Locator;
  readonly statusBadge: Locator;
  readonly cancelButton: Locator;
  readonly writeReviewButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.locator("h1");
    this.reservationInfo = page.locator('[data-testid="reservation-info"]');
    this.qrCode = page.locator('[data-testid="qr-code"]');
    this.campgroundInfo = page.locator('[data-testid="campground-info"]');
    this.statusBadge = page.locator('[data-testid="status-badge"]');
    this.cancelButton = page.getByRole("button", { name: /취소/ });
    this.writeReviewButton = page.getByRole("button", { name: /리뷰 작성/ });
  }

  /**
   * 예약 상세 페이지로 이동
   */
  async goto(reservationId: number) {
    await this.page.goto(`/reservations/${reservationId}`);
  }

  /**
   * 예약 정보가 표시되는지 확인
   */
  async expectReservationInfoVisible() {
    await expect(this.reservationInfo).toBeVisible();
    await expect(this.campgroundInfo).toBeVisible();
  }

  /**
   * QR 코드가 표시되는지 확인
   */
  async expectQRCodeVisible() {
    await expect(this.qrCode).toBeVisible();
  }

  /**
   * 예약 취소
   */
  async cancelReservation() {
    // 확인 다이얼로그 처리
    this.page.on("dialog", (dialog) => dialog.accept());
    await this.cancelButton.click();
  }

  /**
   * 리뷰 작성 페이지로 이동
   */
  async goToWriteReview() {
    await this.writeReviewButton.click();
    await expect(this.page).toHaveURL(/\/review\/new/);
  }
}
