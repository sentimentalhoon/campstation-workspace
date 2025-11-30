import { test } from "@playwright/test";

/**
 * 찜하기 E2E 테스트
 * 찜하기 추가/제거, 찜 목록 조회 플로우 검증
 *
 * @see docs/testing/e2e-testing-guide.md - 찜하기 시나리오
 * @see docs/specifications/03-PAGES.md - 찜하기 페이지
 */
test.describe("찜하기 기능", () => {
  test.skip("캠핑장을 찜할 수 있다", async ({ page }) => {
    // Note: 로그인 및 실제 캠핑장 ID 필요
    // Given: 캠핑장 상세 페이지
    await page.goto("/campgrounds/1");

    // When: 찜하기 버튼 클릭
    const favoriteButton = page.getByRole("button", { name: /찜/ });
    await favoriteButton.click();

    // Then: 찜하기 상태로 변경 (하트 아이콘 채워짐)
    await test.expect(favoriteButton).toHaveAttribute("aria-pressed", "true");
  });

  test.skip("찜한 캠핑장을 찜 해제할 수 있다", async ({ page }) => {
    // Note: 로그인 및 이미 찜한 캠핑장 필요
    // Given: 찜한 캠핑장 상세 페이지
    await page.goto("/campgrounds/1");

    // Given: 찜하기 버튼이 활성화 상태
    const favoriteButton = page.getByRole("button", { name: /찜/ });
    await test.expect(favoriteButton).toHaveAttribute("aria-pressed", "true");

    // When: 찜하기 버튼 다시 클릭
    await favoriteButton.click();

    // Then: 찜 해제 상태로 변경
    await test.expect(favoriteButton).toHaveAttribute("aria-pressed", "false");
  });
});

test.describe("찜 목록", () => {
  test.skip("찜 목록 페이지가 정상적으로 표시된다", async ({ page }) => {
    // Note: 로그인 필요
    // Given: 찜 목록 페이지로 이동
    await page.goto("/dashboard/user/favorites");

    // Then: 페이지 타이틀이 표시된다
    const title = page.locator("h1");
    await test.expect(title).toBeVisible();

    // Then: 찜한 캠핑장 목록 또는 빈 상태가 표시된다
    const content = page.locator("main");
    await test.expect(content).toBeVisible();
  });

  test.skip("찜한 캠핑장 목록이 표시된다", async ({ page }) => {
    // Note: 로그인 및 찜한 캠핑장 있어야 함
    // Given: 찜 목록 페이지
    await page.goto("/dashboard/user/favorites");

    // Then: 찜한 캠핑장 카드가 표시된다
    const campgroundCards = page.locator('[data-testid="campground-card"]');
    await test.expect(campgroundCards.first()).toBeVisible();
  });

  test.skip("찜 목록에서 캠핑장을 클릭하면 상세 페이지로 이동한다", async ({
    page,
  }) => {
    // Note: 로그인 및 찜한 캠핑장 있어야 함
    // Given: 찜 목록 페이지
    await page.goto("/dashboard/user/favorites");

    // When: 첫 번째 캠핑장 클릭
    const firstCard = page.locator('[data-testid="campground-card"]').first();
    await firstCard.click();

    // Then: 캠핑장 상세 페이지로 이동
    await test.expect(page).toHaveURL(/\/campgrounds\/\d+/);
  });

  test.skip("찜 목록에서 바로 찜 해제할 수 있다", async ({ page }) => {
    // Note: 로그인 및 찜한 캠핑장 있어야 함
    // Given: 찜 목록 페이지
    await page.goto("/dashboard/user/favorites");

    // When: 찜하기 버튼 클릭 (찜 해제)
    const favoriteButton = page
      .locator('[data-testid="campground-card"]')
      .first()
      .getByRole("button", { name: /찜/ });
    await favoriteButton.click();

    // Then: 해당 캠핑장이 목록에서 제거된다
    // 구현에 따라 검증 로직 추가 (목록 갱신 또는 카드 제거)
  });
});
