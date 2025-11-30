import { expect, type Locator, type Page } from "@playwright/test";

/**
 * 리뷰 작성 페이지 객체 모델
 * Page Object Pattern을 사용하여 리뷰 작성 페이지의 요소와 액션을 캡슐화
 *
 * @see docs/testing/e2e-testing-guide.md - Page Object Model
 * @see docs/specifications/03-PAGES.md - 리뷰 작성 페이지
 */
export class ReviewNewPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly starRating: Locator;
  readonly commentTextarea: Locator;
  readonly imageUploader: Locator;
  readonly submitButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.locator("h1");
    this.starRating = page.locator('[data-testid="star-rating"]');
    this.commentTextarea = page.getByLabel(/리뷰|후기/i);
    this.imageUploader = page.locator('[data-testid="image-uploader"]');
    this.submitButton = page.getByRole("button", { name: /등록|작성/ });
    this.cancelButton = page.getByRole("button", { name: /취소/ });
  }

  /**
   * 리뷰 작성 페이지로 이동
   */
  async goto(reservationId: number) {
    await this.page.goto(`/reservations/${reservationId}/review/new`);
  }

  /**
   * 별점 선택 (1-5)
   */
  async selectRating(rating: number) {
    // 별점 버튼 클릭 (1-5)
    const star = this.page.locator(`[data-rating="${rating}"]`);
    await star.click();
  }

  /**
   * 리뷰 내용 입력
   */
  async writeComment(comment: string) {
    await this.commentTextarea.fill(comment);
  }

  /**
   * 이미지 업로드
   */
  async uploadImages(filePaths: string[]) {
    // 파일 입력 필드 찾기
    const fileInput = this.page.locator('input[type="file"]');
    await fileInput.setInputFiles(filePaths);
  }

  /**
   * 리뷰 제출
   */
  async submit() {
    await this.submitButton.click();
  }

  /**
   * 리뷰 작성 취소
   */
  async cancel() {
    await this.cancelButton.click();
  }

  /**
   * 예약 상세 페이지로 돌아갔는지 확인
   */
  async expectNavigatedBackToReservation() {
    await expect(this.page).toHaveURL(/\/reservations\/\d+$/);
  }
}

/**
 * 리뷰 수정 페이지 객체 모델
 */
export class ReviewEditPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly starRating: Locator;
  readonly commentTextarea: Locator;
  readonly imageUploader: Locator;
  readonly existingImages: Locator;
  readonly submitButton: Locator;
  readonly deleteButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.locator("h1");
    this.starRating = page.locator('[data-testid="star-rating"]');
    this.commentTextarea = page.getByLabel(/리뷰|후기/i);
    this.imageUploader = page.locator('[data-testid="image-uploader"]');
    this.existingImages = page.locator('[data-testid="existing-images"]');
    this.submitButton = page.getByRole("button", { name: /수정|저장/ });
    this.deleteButton = page.getByRole("button", { name: /삭제/ });
  }

  /**
   * 리뷰 수정 페이지로 이동
   */
  async goto(reviewId: number) {
    await this.page.goto(`/reviews/${reviewId}/edit`);
  }

  /**
   * 별점 수정
   */
  async updateRating(rating: number) {
    const star = this.page.locator(`[data-rating="${rating}"]`);
    await star.click();
  }

  /**
   * 리뷰 내용 수정
   */
  async updateComment(comment: string) {
    await this.commentTextarea.clear();
    await this.commentTextarea.fill(comment);
  }

  /**
   * 리뷰 수정 제출
   */
  async submit() {
    await this.submitButton.click();
  }

  /**
   * 리뷰 삭제
   */
  async delete() {
    // 확인 다이얼로그 처리
    this.page.on("dialog", (dialog) => dialog.accept());
    await this.deleteButton.click();
  }

  /**
   * 기존 이미지가 표시되는지 확인
   */
  async expectExistingImagesVisible() {
    await expect(this.existingImages).toBeVisible();
  }
}
