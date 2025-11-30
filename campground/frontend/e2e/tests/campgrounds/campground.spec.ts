import { test } from "@playwright/test";
import {
  CampgroundDetailPage,
  CampgroundListPage,
} from "../../pages/CampgroundPage";

/**
 * 캠핑장 E2E 테스트
 * 캠핑장 검색, 조회, 상세 페이지 플로우 검증
 *
 * @see docs/testing/e2e-testing-guide.md - 캠핑장 시나리오
 * @see docs/specifications/03-PAGES.md - 캠핑장 페이지
 */
test.describe("캠핑장 목록", () => {
  let campgroundListPage: CampgroundListPage;

  test.beforeEach(async ({ page }) => {
    campgroundListPage = new CampgroundListPage(page);
    await campgroundListPage.goto();
  });

  test("캠핑장 목록 페이지가 정상적으로 표시된다", async () => {
    // Then: 페이지 타이틀이 표시된다
    await campgroundListPage.pageTitle.waitFor();

    // Then: 캠핑장 목록이 표시된다 (최소 1개)
    await campgroundListPage.expectCampgroundsVisible();
  });

  test.skip("캠핑장 카드를 클릭하면 상세 페이지로 이동한다", async () => {
    // Note: 실제 데이터 필요
    // When: 첫 번째 캠핑장 클릭
    await campgroundListPage.clickFirstCampground();

    // Then: 상세 페이지로 이동
    await test.expect(campgroundListPage.page).toHaveURL(/\/campgrounds\/\d+/);
  });
});

test.describe("캠핑장 검색", () => {
  let campgroundListPage: CampgroundListPage;

  test.beforeEach(async ({ page }) => {
    campgroundListPage = new CampgroundListPage(page);
    await campgroundListPage.gotoSearch();
  });

  test("검색 페이지가 정상적으로 표시된다", async () => {
    // Then: 검색 입력 필드가 표시된다
    await campgroundListPage.searchInput.waitFor();

    // Then: 페이지 제목이 표시된다
    await campgroundListPage.pageTitle.waitFor();
  });

  test.skip("캠핑장 이름으로 검색할 수 있다", async () => {
    // Note: 실제 백엔드 연동 필요
    // When: 캠핑장 이름 검색
    await campgroundListPage.search("테스트 캠핑장");

    // Then: 검색 결과가 표시된다
    await campgroundListPage.expectCampgroundsVisible();
  });
});

test.describe("캠핑장 상세", () => {
  let campgroundDetailPage: CampgroundDetailPage;

  test.beforeEach(async ({ page }) => {
    campgroundDetailPage = new CampgroundDetailPage(page);
  });

  test.skip("캠핑장 상세 정보가 표시된다", async () => {
    // Note: 실제 캠핑장 ID 필요
    // Given: 캠핑장 상세 페이지로 이동
    await campgroundDetailPage.goto(1);

    // Then: 캠핑장 정보가 표시된다
    await campgroundDetailPage.expectCampgroundInfoVisible();

    // Then: 예약하기 버튼이 표시된다
    await campgroundDetailPage.reserveButton.waitFor();

    // Then: 찜하기 버튼이 표시된다
    await campgroundDetailPage.favoriteButton.waitFor();
  });

  test.skip("예약하기 버튼을 클릭하면 예약 페이지로 이동한다", async () => {
    // Note: 실제 캠핑장 ID 필요
    // Given: 캠핑장 상세 페이지
    await campgroundDetailPage.goto(1);

    // When: 예약하기 버튼 클릭
    await campgroundDetailPage.clickReserve();

    // Then: 예약 페이지로 이동
    await campgroundDetailPage.expectNavigatedToReservation();
  });
});
