import { test } from "@playwright/test";
import { ReviewEditPage, ReviewNewPage } from "../../pages/ReviewPage";

/**
 * 리뷰 E2E 테스트
 * 리뷰 작성, 수정, 삭제 플로우 검증
 *
 * @see docs/testing/e2e-testing-guide.md - 리뷰 시나리오
 * @see docs/specifications/03-PAGES.md - 리뷰 페이지
 */
test.describe("리뷰 작성", () => {
  let reviewNewPage: ReviewNewPage;

  test.beforeEach(async ({ page }) => {
    reviewNewPage = new ReviewNewPage(page);
  });

  test.skip("리뷰 작성 페이지가 정상적으로 표시된다", async () => {
    // Note: 실제 완료된 예약 ID 필요
    // Given: 리뷰 작성 페이지로 이동
    await reviewNewPage.goto(1);

    // Then: 페이지 요소들이 표시된다
    await reviewNewPage.pageTitle.waitFor();
    await reviewNewPage.starRating.waitFor();
    await reviewNewPage.commentTextarea.waitFor();
    await reviewNewPage.submitButton.waitFor();
  });

  test.skip("별점과 텍스트로 리뷰를 작성할 수 있다", async () => {
    // Note: 실제 완료된 예약 ID 필요
    // Given: 리뷰 작성 페이지
    await reviewNewPage.goto(1);

    // When: 별점 선택 (5점)
    await reviewNewPage.selectRating(5);

    // When: 리뷰 내용 작성
    await reviewNewPage.writeComment(
      "정말 좋은 캠핑장이었습니다! 시설도 깨끗하고 경치도 아름다웠어요."
    );

    // When: 리뷰 제출
    await reviewNewPage.submit();

    // Then: 예약 상세 페이지로 돌아간다
    await reviewNewPage.expectNavigatedBackToReservation();
  });

  test.skip("이미지와 함께 리뷰를 작성할 수 있다", async () => {
    // Note: 실제 완료된 예약 ID 및 테스트 이미지 파일 필요
    // Given: 리뷰 작성 페이지
    await reviewNewPage.goto(1);

    // When: 별점 및 내용 작성
    await reviewNewPage.selectRating(4);
    await reviewNewPage.writeComment("좋았습니다!");

    // When: 이미지 업로드
    await reviewNewPage.uploadImages(["test-image-1.jpg", "test-image-2.jpg"]);

    // When: 리뷰 제출
    await reviewNewPage.submit();

    // Then: 예약 상세 페이지로 돌아간다
    await reviewNewPage.expectNavigatedBackToReservation();
  });

  test.skip("필수 항목 미입력 시 제출 불가", async () => {
    // Note: 실제 완료된 예약 ID 필요
    // Given: 리뷰 작성 페이지
    await reviewNewPage.goto(1);

    // When: 리뷰 내용만 작성 (별점 선택 안 함)
    await reviewNewPage.writeComment("리뷰 내용");

    // When: 제출 시도
    await reviewNewPage.submitButton.click();

    // Then: 에러 메시지 또는 별점 선택 요구
    // 구현에 따라 검증 로직 추가
  });
});

test.describe("리뷰 수정", () => {
  let reviewEditPage: ReviewEditPage;

  test.beforeEach(async ({ page }) => {
    reviewEditPage = new ReviewEditPage(page);
  });

  test.skip("리뷰 수정 페이지가 정상적으로 표시된다", async () => {
    // Note: 실제 리뷰 ID 필요
    // Given: 리뷰 수정 페이지로 이동
    await reviewEditPage.goto(1);

    // Then: 페이지 요소들이 표시된다
    await reviewEditPage.pageTitle.waitFor();
    await reviewEditPage.starRating.waitFor();
    await reviewEditPage.commentTextarea.waitFor();

    // Then: 기존 데이터가 로드된다
    const comment = await reviewEditPage.commentTextarea.inputValue();
    await test.expect(comment).not.toBe("");
  });

  test.skip("기존 이미지가 표시된다", async () => {
    // Note: TODO 해결 후 테스트 가능
    // Given: 이미지가 있는 리뷰 수정 페이지
    await reviewEditPage.goto(1);

    // Then: 기존 이미지가 표시된다
    await reviewEditPage.expectExistingImagesVisible();
  });

  test.skip("리뷰 내용을 수정할 수 있다", async () => {
    // Note: 실제 리뷰 ID 필요
    // Given: 리뷰 수정 페이지
    await reviewEditPage.goto(1);

    // When: 별점 변경
    await reviewEditPage.updateRating(3);

    // When: 내용 변경
    await reviewEditPage.updateComment("수정된 리뷰 내용입니다.");

    // When: 수정 제출
    await reviewEditPage.submit();

    // Then: 예약 상세 또는 리뷰 목록으로 이동
    await test
      .expect(reviewEditPage.page)
      .toHaveURL(/\/(reservations|reviews)/);
  });

  test.skip("리뷰를 삭제할 수 있다", async () => {
    // Note: 실제 리뷰 ID 필요
    // Given: 리뷰 수정 페이지
    await reviewEditPage.goto(1);

    // When: 삭제 버튼 클릭
    await reviewEditPage.delete();

    // Then: 리뷰 목록 또는 예약 상세로 이동
    await test
      .expect(reviewEditPage.page)
      .toHaveURL(/\/(reservations|dashboard)/);
  });
});
