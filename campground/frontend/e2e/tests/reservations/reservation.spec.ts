import { test } from "@playwright/test";
import {
  ReservationDetailPage,
  ReservationNewPage,
} from "../../pages/ReservationPage";

/**
 * 예약 E2E 테스트
 * 예약 생성, 조회, 취소 플로우 검증
 *
 * @see docs/testing/e2e-testing-guide.md - 예약 시나리오
 * @see docs/specifications/03-PAGES.md - 예약 페이지
 */
test.describe("예약 생성", () => {
  let reservationPage: ReservationNewPage;

  test.beforeEach(async ({ page }) => {
    reservationPage = new ReservationNewPage(page);
  });

  test("예약 생성 페이지가 정상적으로 표시된다", async () => {
    // Given: 예약 페이지로 이동 (캠핑장 ID 포함)
    await reservationPage.goto(1);

    // Then: 페이지 타이틀이 표시된다
    await reservationPage.pageTitle.waitFor();

    // Then: 예약 폼이 표시된다
    await reservationPage.submitButton.waitFor();
  });

  test.skip("캠핑장 ID 없이 접근하면 에러 표시", async () => {
    // Note: 실제 에러 처리 구현 확인 필요
    // When: 캠핑장 ID 없이 접근
    await reservationPage.goto();

    // Then: 에러 메시지 또는 리다이렉트
    // 구현에 따라 검증 로직 추가
  });

  test.skip("예약 정보를 입력하고 결제 페이지로 이동한다", async () => {
    // Note: 실제 백엔드 연동 및 결제 연동 필요
    // Given: 예약 페이지
    await reservationPage.goto(1);

    // When: 체크인/체크아웃 날짜 선택
    const checkIn = new Date();
    checkIn.setDate(checkIn.getDate() + 7); // 7일 후
    const checkOut = new Date();
    checkOut.setDate(checkOut.getDate() + 9); // 9일 후

    await reservationPage.selectDates(
      checkIn.toISOString().split("T")[0],
      checkOut.toISOString().split("T")[0]
    );

    // When: 인원 수 선택
    await reservationPage.selectGuestCount(4);

    // Then: 총 가격이 계산되어 표시된다
    await reservationPage.expectTotalPriceVisible();

    // When: 예약 제출
    await reservationPage.submit();

    // Then: 결제 페이지로 이동
    await reservationPage.expectNavigatedToPayment();
  });
});

test.describe("예약 상세", () => {
  let reservationDetailPage: ReservationDetailPage;

  test.beforeEach(async ({ page }) => {
    reservationDetailPage = new ReservationDetailPage(page);
  });

  test.skip("예약 상세 정보가 표시된다", async () => {
    // Note: 실제 예약 ID 필요
    // Given: 예약 상세 페이지로 이동
    await reservationDetailPage.goto(1);

    // Then: 예약 정보가 표시된다
    await reservationDetailPage.expectReservationInfoVisible();

    // Then: QR 코드가 표시된다
    await reservationDetailPage.expectQRCodeVisible();
  });

  test.skip("예약을 취소할 수 있다", async () => {
    // Note: 실제 예약 ID 및 취소 가능한 상태 필요
    // Given: 예약 상세 페이지
    await reservationDetailPage.goto(1);

    // When: 취소 버튼 클릭
    await reservationDetailPage.cancelReservation();

    // Then: 예약 상태가 "취소됨"으로 변경
    await reservationDetailPage.statusBadge.waitFor();
    await test.expect(reservationDetailPage.statusBadge).toContainText(/취소/);
  });

  test.skip("완료된 예약은 리뷰를 작성할 수 있다", async () => {
    // Note: 실제 완료된 예약 ID 필요
    // Given: 완료된 예약 상세 페이지
    await reservationDetailPage.goto(1);

    // When: 리뷰 작성 버튼 클릭
    await reservationDetailPage.goToWriteReview();

    // Then: 리뷰 작성 페이지로 이동
    // (goToWriteReview 메서드 내에서 검증)
  });
});
