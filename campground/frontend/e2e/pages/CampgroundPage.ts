import { expect, type Locator, type Page } from "@playwright/test";

/**
 * 캠핑장 목록 페이지 객체 모델
 * Page Object Pattern을 사용하여 캠핑장 목록/검색 페이지의 요소와 액션을 캡슐화
 *
 * @see docs/testing/e2e-testing-guide.md - Page Object Model
 * @see docs/specifications/03-PAGES.md - 캠핑장 목록 페이지
 */
export class CampgroundListPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly campgroundCards: Locator;
  readonly searchInput: Locator;
  readonly filterButtons: Locator;
  readonly regionFilter: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.locator("h1");
    this.campgroundCards = page.locator('[data-testid="campground-card"]');
    this.searchInput = page.getByPlaceholder(/캠핑장 검색/i);
    this.filterButtons = page
      .locator('[role="group"]')
      .filter({ hasText: /지역/ });
    this.regionFilter = page.getByRole("button", { name: /지역/ });
  }

  /**
   * 캠핑장 목록 페이지로 이동
   */
  async goto() {
    await this.page.goto("/campgrounds");
  }

  /**
   * 캠핑장 검색 페이지로 이동
   */
  async gotoSearch() {
    await this.page.goto("/campgrounds/search");
  }

  /**
   * 캠핑장 목록이 표시되는지 확인
   */
  async expectCampgroundsVisible() {
    await expect(this.campgroundCards.first()).toBeVisible();
  }

  /**
   * 특정 개수의 캠핑장이 표시되는지 확인
   */
  async expectCampgroundCount(count: number) {
    await expect(this.campgroundCards).toHaveCount(count);
  }

  /**
   * 캠핑장 카드 클릭하여 상세 페이지로 이동
   */
  async clickFirstCampground() {
    await this.campgroundCards.first().click();
  }

  /**
   * 특정 인덱스의 캠핑장 클릭
   */
  async clickCampgroundAt(index: number) {
    await this.campgroundCards.nth(index).click();
  }

  /**
   * 캠핑장 검색
   */
  async search(query: string) {
    await this.searchInput.fill(query);
    await this.searchInput.press("Enter");
  }
}

/**
 * 캠핑장 상세 페이지 객체 모델
 */
export class CampgroundDetailPage {
  readonly page: Page;
  readonly campgroundName: Locator;
  readonly campgroundImages: Locator;
  readonly priceInfo: Locator;
  readonly description: Locator;
  readonly reserveButton: Locator;
  readonly favoriteButton: Locator;
  readonly reviewSection: Locator;
  readonly mapSection: Locator;

  constructor(page: Page) {
    this.page = page;
    this.campgroundName = page.locator("h1").first();
    this.campgroundImages = page.locator('[data-testid="campground-image"]');
    this.priceInfo = page.getByText(/₩|원/);
    this.description = page.locator('[data-testid="description"]');
    this.reserveButton = page.getByRole("button", { name: /예약하기|예약/ });
    this.favoriteButton = page.getByRole("button", { name: /찜하기|찜/ });
    this.reviewSection = page.locator('[data-testid="reviews"]');
    this.mapSection = page.locator('[data-testid="map"]');
  }

  /**
   * 캠핑장 상세 페이지로 이동
   */
  async goto(campgroundId: number) {
    await this.page.goto(`/campgrounds/${campgroundId}`);
  }

  /**
   * 캠핑장 정보가 표시되는지 확인
   */
  async expectCampgroundInfoVisible() {
    await expect(this.campgroundName).toBeVisible();
    await expect(this.priceInfo).toBeVisible();
  }

  /**
   * 예약하기 버튼 클릭
   */
  async clickReserve() {
    await this.reserveButton.click();
  }

  /**
   * 찜하기 버튼 클릭
   */
  async clickFavorite() {
    await this.favoriteButton.click();
  }

  /**
   * 예약 페이지로 이동했는지 확인
   */
  async expectNavigatedToReservation() {
    await expect(this.page).toHaveURL(/\/reservations\/new/);
  }
}
