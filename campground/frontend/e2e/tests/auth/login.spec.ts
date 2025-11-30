import { test } from "@playwright/test";
import { LoginPage } from "../../pages/LoginPage";

/**
 * 로그인 E2E 테스트
 * 사용자 인증 플로우 검증
 *
 * @see docs/testing/e2e-testing-guide.md - 인증 플로우
 */
test.describe("로그인", () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test("로그인 페이지가 정상적으로 표시된다", async () => {
    // Then: 로그인 폼이 표시된다
    await loginPage.emailInput.waitFor();
    await loginPage.passwordInput.waitFor();
    await loginPage.loginButton.waitFor();
  });

  test("회원가입 페이지로 이동할 수 있다", async () => {
    // When: 회원가입 링크 클릭
    await loginPage.goToRegister();
  });

  test.skip("올바른 정보로 로그인 성공", async () => {
    // Note: 실제 백엔드 연동이 필요하므로 skip
    // Given: 테스트 사용자 계정
    const testEmail = "test@campstation.com";
    const testPassword = "Test1234!";

    // When: 로그인 시도
    await loginPage.login(testEmail, testPassword);

    // Then: 로그인 성공 (대시보드로 이동)
    await loginPage.expectLoginSuccess();
  });

  test.skip("잘못된 비밀번호로 로그인 실패", async () => {
    // Note: 실제 백엔드 연동이 필요하므로 skip
    // Given: 잘못된 비밀번호
    const testEmail = "test@campstation.com";
    const wrongPassword = "WrongPassword123";

    // When: 로그인 시도
    await loginPage.login(testEmail, wrongPassword);

    // Then: 에러 메시지 표시
    await loginPage.expectLoginError();
  });

  test("빈 이메일로 로그인 불가", async () => {
    // When: 빈 이메일로 로그인 시도
    await loginPage.login("", "password123");

    // Then: 이메일 입력 필드의 HTML5 validation 동작
    const isInvalid = await loginPage.emailInput.evaluate(
      (el: HTMLInputElement) => !el.validity.valid
    );
    await test.expect(isInvalid).toBe(true);
  });

  test("빈 비밀번호로 로그인 불가", async () => {
    // When: 빈 비밀번호로 로그인 시도
    await loginPage.login("test@campstation.com", "");

    // Then: 비밀번호 입력 필드의 HTML5 validation 동작
    const isInvalid = await loginPage.passwordInput.evaluate(
      (el: HTMLInputElement) => !el.validity.valid
    );
    await test.expect(isInvalid).toBe(true);
  });
});
