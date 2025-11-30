import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright E2E 테스트 설정
 * @see https://playwright.dev/docs/test-configuration
 * @see docs/testing/e2e-testing-guide.md
 */
export default defineConfig({
  // 테스트 디렉토리
  testDir: "./e2e",

  // 테스트 파일 패턴
  testMatch: "**/*.spec.ts",

  // 병렬 실행
  fullyParallel: true,

  // 실패 시 재시도
  retries: process.env.CI ? 2 : 0,

  // 워커 수 (CI에서는 1개, 로컬에서는 CPU 기반)
  workers: process.env.CI ? 1 : undefined,

  // 리포터
  reporter: [
    ["html", { outputFolder: "playwright-report" }],
    ["json", { outputFile: "test-results/results.json" }],
    ["list"],
  ],

  // 타임아웃
  timeout: 30 * 1000, // 30초

  // 공통 설정
  use: {
    // Base URL
    baseURL: process.env.BASE_URL || "http://localhost:3000",

    // 스크린샷 (실패 시에만)
    screenshot: "only-on-failure",

    // 비디오 (실패 시에만)
    video: "retain-on-failure",

    // Trace (실패 시 리트라이에만)
    trace: "on-first-retry",

    // 네비게이션 타임아웃
    navigationTimeout: 30 * 1000,

    // 액션 타임아웃
    actionTimeout: 10 * 1000,
  },

  // 프로젝트별 설정
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    // 필요시 다른 브라우저 추가
    // {
    //   name: "firefox",
    //   use: { ...devices["Desktop Firefox"] },
    // },
    // {
    //   name: "webkit",
    //   use: { ...devices["Desktop Safari"] },
    // },
    // {
    //   name: "mobile",
    //   use: { ...devices["iPhone 13"] },
    // },
  ],

  // 개발 서버 자동 시작
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2분
  },
});
