import { expect, type Locator, type Page } from "@playwright/test";

/**
 * 로그인 페이지 객체 모델
 * Page Object Pattern을 사용하여 로그인 페이지의 요소와 액션을 캡슐화
 *
 * @see docs/testing/e2e-testing-guide.md - Page Object Model
 */
export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly registerLink: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByLabel("이메일");
    this.passwordInput = page.getByLabel("비밀번호");
    this.loginButton = page.getByRole("button", { name: "로그인" });
    this.registerLink = page.getByRole("link", { name: "회원가입" });
    this.errorMessage = page.locator('[role="alert"]');
  }

  /**
   * 로그인 페이지로 이동
   */
  async goto() {
    await this.page.goto("/login");
  }

  /**
   * 로그인 수행
   */
  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  /**
   * 로그인 성공 검증
   */
  async expectLoginSuccess() {
    // 대시보드 또는 홈으로 리다이렉트
    await expect(this.page).toHaveURL(/\/(dashboard\/user|)/);
  }

  /**
   * 로그인 실패 검증
   */
  async expectLoginError(message?: string) {
    await expect(this.errorMessage).toBeVisible();
    if (message) {
      await expect(this.errorMessage).toContainText(message);
    }
  }

  /**
   * 회원가입 페이지로 이동
   */
  async goToRegister() {
    await this.registerLink.click();
    await expect(this.page).toHaveURL("/register");
  }
}
