import { expect, test } from "@playwright/test";

/**
 * 홈페이지 기본 E2E 테스트
 * 애플리케이션의 기본 동작 검증
 */
test.describe("홈페이지", () => {
  test("홈페이지가 정상적으로 로드된다", async ({ page }) => {
    // Given: 홈페이지로 이동
    await page.goto("/");

    // Then: 페이지 타이틀이 올바르게 표시된다
    await expect(page).toHaveTitle(/CampStation/);

    // Then: 메인 헤더가 표시된다
    const header = page.locator("header");
    await expect(header).toBeVisible();

    // Then: 로고가 표시된다
    const logo = page.locator('a[href="/"]').first();
    await expect(logo).toBeVisible();
  });

  test("네비게이션 메뉴가 동작한다", async ({ page }) => {
    // Given: 홈페이지로 이동
    await page.goto("/");

    // When: 캠핑장 목록 링크 클릭
    await page.click('a[href="/campgrounds"]');

    // Then: 캠핑장 목록 페이지로 이동
    await expect(page).toHaveURL("/campgrounds");

    // Then: 캠핑장 목록이 표시된다
    await expect(page.locator("h1")).toContainText("캠핑장");
  });

  test("하단 네비게이션이 동작한다", async ({ page }) => {
    // Given: 모바일 뷰포트에서 홈페이지로 이동
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    // When: 검색 아이콘/링크 클릭 (하단 네비게이션 또는 상단)
    const searchLink = page.locator('a[href="/campgrounds/search"]').first();
    await searchLink.click();

    // Then: 검색 페이지로 이동
    await expect(page).toHaveURL("/campgrounds/search");
  });

  test("반응형 레이아웃이 동작한다", async ({ page }) => {
    // Given: 모바일 뷰포트 설정
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    // Then: 모바일에서 페이지가 정상적으로 표시된다
    const header = page.locator("header");
    await expect(header).toBeVisible();

    // When: 데스크톱 뷰포트로 변경
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/"); // 뷰포트 변경 후 새로고침

    // Then: 데스크톱에서도 헤더가 정상적으로 표시된다
    await expect(header).toBeVisible();
  });
});
