# E2E 테스트 가이드

> Playwright를 이용한 End-to-End 테스트 작성 가이드

## 📋 목차

1. [개요](#개요)
2. [환경 설정](#환경-설정)
3. [기본 테스트 작성](#기본-테스트-작성)
4. [페이지 객체 모델](#페이지-객체-모델)
5. [테스트 시나리오](#테스트-시나리오)
6. [베스트 프랙티스](#베스트-프랙티스)
7. [CI/CD 통합](#cicd-통합)

---

## 📖 개요

### E2E 테스트란?

End-to-End 테스트는 사용자 관점에서 애플리케이션의 전체 플로우를 검증하는 테스트입니다.

**장점**:

- 실제 사용자 시나리오 검증
- UI와 백엔드의 통합 테스트
- 회귀 버그 조기 발견
- 자동화된 QA

**언제 작성하나요?**:

- 핵심 사용자 플로우 (로그인, 예약, 결제)
- 복잡한 폼 처리
- 여러 페이지에 걸친 워크플로우
- 자주 버그가 발생하는 부분

### Playwright 선택 이유

```
✅ 빠른 실행 속도
✅ 강력한 자동 대기 (auto-wait)
✅ 여러 브라우저 지원 (Chromium, Firefox, WebKit)
✅ 스크린샷 및 비디오 녹화
✅ TypeScript 네이티브 지원
✅ 훌륭한 디버깅 도구
```

---

## 🛠️ 환경 설정

### 1. Playwright 설치

```bash
# Playwright 설치
npm install -D @playwright/test

# 브라우저 자동 설치
npx playwright install

# 특정 브라우저만 설치
npx playwright install chromium
```

### 2. 설정 파일 생성

```typescript
// playwright.config.ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  // 테스트 디렉토리
  testDir: "./e2e",

  // 테스트 파일 패턴
  testMatch: "**/*.spec.ts",

  // 병렬 실행
  fullyParallel: true,

  // 실패 시 재시도
  retries: process.env.CI ? 2 : 0,

  // 워커 수
  workers: process.env.CI ? 1 : undefined,

  // 리포터
  reporter: [["html"], ["json", { outputFile: "test-results/results.json" }]],

  // 공통 설정
  use: {
    // Base URL
    baseURL: "http://localhost:3000",

    // 스크린샷 (실패 시에만)
    screenshot: "only-on-failure",

    // 비디오 (실패 시에만)
    video: "retain-on-failure",

    // Trace (실패 시에만)
    trace: "on-first-retry",
  },

  // 프로젝트별 설정
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
    {
      name: "mobile",
      use: { ...devices["iPhone 13"] },
    },
  ],

  // 개발 서버 자동 시작
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
```

### 3. 디렉토리 구조

```
e2e/
├── fixtures/              # 테스트 픽스처
│   ├── auth.fixture.ts
│   └── data.fixture.ts
├── pages/                 # 페이지 객체
│   ├── LoginPage.ts
│   ├── CampgroundPage.ts
│   └── ReservationPage.ts
├── tests/                 # 테스트 파일
│   ├── auth/
│   │   └── login.spec.ts
│   ├── campgrounds/
│   │   └── search.spec.ts
│   └── reservations/
│       └── create.spec.ts
└── utils/                 # 유틸리티
    ├── helpers.ts
    └── test-data.ts
```

---

## ✍️ 기본 테스트 작성

### 첫 번째 테스트

```typescript
// e2e/tests/homepage.spec.ts
import { test, expect } from "@playwright/test";

test.describe("홈페이지", () => {
  test("페이지가 정상적으로 로드된다", async ({ page }) => {
    // 페이지 방문
    await page.goto("/");

    // 제목 확인
    await expect(page).toHaveTitle(/CampStation/);

    // 헤더 확인
    const header = page.locator("header");
    await expect(header).toBeVisible();

    // 로고 확인
    const logo = page.getByRole("link", { name: "CampStation" });
    await expect(logo).toBeVisible();
  });

  test("검색 기능이 작동한다", async ({ page }) => {
    await page.goto("/");

    // 검색 입력
    const searchInput = page.getByPlaceholder("캠핑장 검색");
    await searchInput.fill("춘천");

    // 검색 버튼 클릭
    const searchButton = page.getByRole("button", { name: "검색" });
    await searchButton.click();

    // URL 확인
    await expect(page).toHaveURL(/\/campgrounds\?query=춘천/);

    // 결과 확인
    const results = page.locator('[data-testid="campground-card"]');
    await expect(results).toHaveCount(10); // 페이지당 10개
  });
});
```

### Locator 전략

```typescript
// ✅ 좋은 Locator (안정적)
page.getByRole("button", { name: "로그인" });
page.getByLabel("이메일");
page.getByPlaceholder("이름을 입력하세요");
page.getByText("환영합니다");
page.getByTestId("campground-card");

// ⚠️ 피해야 할 Locator (깨지기 쉬움)
page.locator(".btn-primary"); // 클래스명 변경 시 깨짐
page.locator("#submit-button"); // ID 변경 시 깨짐
page.locator("div > button:nth-child(2)"); // DOM 구조 변경 시 깨짐
```

### 자동 대기 (Auto-wait)

Playwright는 자동으로 요소를 기다립니다:

```typescript
// ✅ 자동 대기 - 권장
await page.getByRole("button").click();

// ❌ 수동 대기 - 불필요
await page.waitForSelector("button");
await page.locator("button").click();
```

---

## 📄 페이지 객체 모델 (POM)

페이지 객체 모델을 사용하면 테스트 코드를 재사용하고 유지보수하기 쉽습니다.

### 로그인 페이지 객체

```typescript
// e2e/pages/LoginPage.ts
import { Page, expect } from "@playwright/test";

export class LoginPage {
  constructor(private page: Page) {}

  // Locators
  get emailInput() {
    return this.page.getByLabel("이메일");
  }

  get passwordInput() {
    return this.page.getByLabel("비밀번호");
  }

  get loginButton() {
    return this.page.getByRole("button", { name: "로그인" });
  }

  get errorMessage() {
    return this.page.getByRole("alert");
  }

  // Actions
  async goto() {
    await this.page.goto("/login");
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async expectLoginSuccess() {
    await expect(this.page).toHaveURL("/dashboard/user");
  }

  async expectLoginError(message: string) {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toContainText(message);
  }
}
```

### 페이지 객체 사용

```typescript
// e2e/tests/auth/login.spec.ts
import { test } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";

test.describe("로그인", () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test("올바른 정보로 로그인 성공", async () => {
    await loginPage.login("user@example.com", "password123");
    await loginPage.expectLoginSuccess();
  });

  test("잘못된 비밀번호로 로그인 실패", async () => {
    await loginPage.login("user@example.com", "wrongpassword");
    await loginPage.expectLoginError(
      "이메일 또는 비밀번호가 올바르지 않습니다"
    );
  });

  test("빈 이메일로 로그인 불가", async () => {
    await loginPage.login("", "password123");
    await loginPage.expectLoginError("이메일을 입력하세요");
  });
});
```

---

## 🎬 테스트 시나리오

### 1. 인증 플로우

```typescript
// e2e/tests/auth/signup.spec.ts
import { test, expect } from "@playwright/test";

test.describe("회원가입", () => {
  test("정상 회원가입 플로우", async ({ page }) => {
    await page.goto("/signup");

    // 1. 정보 입력
    await page.getByLabel("이메일").fill("newuser@example.com");
    await page.getByLabel("비밀번호").fill("SecurePass123!");
    await page.getByLabel("비밀번호 확인").fill("SecurePass123!");
    await page.getByLabel("이름").fill("홍길동");
    await page.getByLabel("전화번호").fill("010-1234-5678");

    // 2. 약관 동의
    await page.getByLabel("이용약관 동의").check();
    await page.getByLabel("개인정보 처리방침 동의").check();

    // 3. 가입 버튼 클릭
    await page.getByRole("button", { name: "가입하기" }).click();

    // 4. 성공 확인
    await expect(page).toHaveURL("/login");
    await expect(page.getByText("회원가입이 완료되었습니다")).toBeVisible();
  });

  test("중복 이메일 검증", async ({ page }) => {
    await page.goto("/signup");

    // 이미 존재하는 이메일
    await page.getByLabel("이메일").fill("existing@example.com");
    await page.getByLabel("비밀번호").fill("password123");

    await page.getByRole("button", { name: "가입하기" }).click();

    // 에러 메시지 확인
    await expect(page.getByText("이미 사용 중인 이메일입니다")).toBeVisible();
  });
});
```

### 2. 캠핑장 검색 및 상세

```typescript
// e2e/tests/campgrounds/search.spec.ts
test.describe("캠핑장 검색", () => {
  test("지역별 필터 검색", async ({ page }) => {
    await page.goto("/campgrounds");

    // 1. 지역 필터 선택
    await page.getByLabel("지역 선택").selectOption("강원도");

    // 2. 검색 버튼 클릭
    await page.getByRole("button", { name: "검색" }).click();

    // 3. 결과 확인
    const cards = page.locator('[data-testid="campground-card"]');
    await expect(cards.first()).toBeVisible();

    // 4. 모든 결과가 강원도인지 확인
    const addresses = await cards.locator(".address").allTextContents();
    addresses.forEach((addr) => {
      expect(addr).toContain("강원");
    });
  });

  test("캠핑장 상세 페이지 이동", async ({ page }) => {
    await page.goto("/campgrounds");

    // 1. 첫 번째 캠핑장 클릭
    const firstCard = page.locator('[data-testid="campground-card"]').first();
    await firstCard.click();

    // 2. 상세 페이지 확인
    await expect(page).toHaveURL(/\/campgrounds\/\d+/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // 3. 주요 정보 표시 확인
    await expect(page.getByText(/주소:/)).toBeVisible();
    await expect(page.getByText(/가격:/)).toBeVisible();
    await expect(page.getByRole("button", { name: "예약하기" })).toBeVisible();
  });
});
```

### 3. 예약 생성 플로우

```typescript
// e2e/tests/reservations/create.spec.ts
test.describe("예약 생성", () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 상태로 시작
    await page.goto("/login");
    await page.getByLabel("이메일").fill("user@example.com");
    await page.getByLabel("비밀번호").fill("password123");
    await page.getByRole("button", { name: "로그인" }).click();
    await page.waitForURL("/dashboard/user");
  });

  test("캠핑장 예약 전체 플로우", async ({ page }) => {
    // 1. 캠핑장 선택
    await page.goto("/campgrounds");
    await page.locator('[data-testid="campground-card"]').first().click();

    // 2. 예약 정보 입력
    await page.getByRole("button", { name: "예약하기" }).click();

    // 날짜 선택
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await page.getByLabel("체크인").fill(tomorrow.toISOString().split("T")[0]);

    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 2);
    await page
      .getByLabel("체크아웃")
      .fill(dayAfter.toISOString().split("T")[0]);

    // 인원 선택
    await page.getByLabel("인원").selectOption("4");

    // 3. 결제 정보 입력
    await page.getByRole("button", { name: "다음" }).click();

    await page.getByLabel("카드번호").fill("1234-5678-9012-3456");
    await page.getByLabel("유효기간").fill("12/25");
    await page.getByLabel("CVV").fill("123");

    // 4. 예약 확인 및 완료
    await page.getByRole("button", { name: "결제하기" }).click();

    // 5. 성공 메시지 확인
    await expect(page.getByText("예약이 완료되었습니다")).toBeVisible();
    await expect(page).toHaveURL(/\/reservations\/\d+/);

    // 6. 예약 내역에 표시되는지 확인
    await page.goto("/dashboard/user/reservations");
    const reservationCards = page.locator('[data-testid="reservation-card"]');
    await expect(reservationCards).toHaveCount(1);
  });
});
```

### 4. 리뷰 작성

```typescript
// e2e/tests/reviews/create.spec.ts
test.describe("리뷰 작성", () => {
  test("예약 완료 후 리뷰 작성", async ({ page }) => {
    // 로그인
    await page.goto("/login");
    await page.getByLabel("이메일").fill("user@example.com");
    await page.getByLabel("비밀번호").fill("password123");
    await page.getByRole("button", { name: "로그인" }).click();

    // 예약 내역으로 이동
    await page.goto("/dashboard/user/reservations");

    // 완료된 예약에서 리뷰 작성 버튼 클릭
    const completedReservation = page
      .locator('[data-testid="reservation-card"]')
      .filter({ hasText: "이용 완료" })
      .first();

    await completedReservation
      .getByRole("button", { name: "리뷰 작성" })
      .click();

    // 리뷰 작성
    await page.getByLabel("별점").selectOption("5");
    await page.getByLabel("리뷰 제목").fill("정말 좋았어요!");
    await page
      .getByLabel("리뷰 내용")
      .fill("가족과 함께 즐거운 시간을 보냈습니다.");

    // 이미지 업로드
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles("./test-data/campsite.jpg");

    // 제출
    await page.getByRole("button", { name: "리뷰 등록" }).click();

    // 성공 확인
    await expect(page.getByText("리뷰가 등록되었습니다")).toBeVisible();

    // 리뷰 목록에 표시되는지 확인
    await page.goto("/dashboard/user/reviews");
    await expect(page.getByText("정말 좋았어요!")).toBeVisible();
  });
});
```

---

## 💡 베스트 프랙티스

### 1. 테스트 격리

```typescript
// ✅ 각 테스트는 독립적이어야 함
test("테스트 1", async ({ page }) => {
  await page.goto("/");
  // 이 테스트만의 데이터 사용
});

test("테스트 2", async ({ page }) => {
  await page.goto("/");
  // 테스트 1의 결과에 의존하지 않음
});
```

### 2. 안정적인 Locator 사용

```typescript
// ✅ 좋은 예
page.getByRole("button", { name: "로그인" });
page.getByLabel("이메일");
page.getByTestId("campground-card");

// ❌ 나쁜 예
page.locator(".login-btn");
page.locator("#email-input");
```

### 3. 명시적 Assertion

```typescript
// ✅ 명확한 검증
await expect(page.getByText("환영합니다")).toBeVisible();
await expect(page).toHaveURL("/dashboard");
await expect(page).toHaveTitle(/CampStation/);

// ❌ 불명확한 검증
await page.waitForTimeout(1000); // 시간 기반 대기
```

### 4. 테스트 데이터 관리

```typescript
// e2e/utils/test-data.ts
export const TEST_USERS = {
  admin: {
    email: "admin@example.com",
    password: "admin123",
  },
  user: {
    email: "user@example.com",
    password: "user123",
  },
};

export const TEST_CAMPGROUNDS = [
  {
    id: 1,
    name: "춘천 캠핑장",
    region: "강원도",
  },
];

// 테스트에서 사용
import { TEST_USERS } from "../utils/test-data";

test("로그인", async ({ page }) => {
  await loginPage.login(TEST_USERS.user.email, TEST_USERS.user.password);
});
```

### 5. Fixture 활용

```typescript
// e2e/fixtures/auth.fixture.ts
import { test as base } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";

type AuthFixtures = {
  loginPage: LoginPage;
  authenticatedPage: Page;
};

export const test = base.extend<AuthFixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  authenticatedPage: async ({ page }, use) => {
    // 자동 로그인
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login("user@example.com", "password123");
    await use(page);
  },
});

// 사용
test("대시보드 접근", async ({ authenticatedPage }) => {
  await authenticatedPage.goto("/dashboard/user");
  // 이미 로그인된 상태
});
```

### 6. 에러 핸들링

```typescript
test("API 에러 처리", async ({ page }) => {
  // 네트워크 에러 시뮬레이션
  await page.route("**/api/campgrounds", (route) => {
    route.abort("failed");
  });

  await page.goto("/campgrounds");

  // 에러 메시지 확인
  await expect(
    page.getByText("데이터를 불러오는데 실패했습니다")
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "다시 시도" })).toBeVisible();
});
```

### 7. 스크린샷 및 비디오

```typescript
test("시각적 확인이 필요한 테스트", async ({ page }) => {
  await page.goto("/campgrounds/1");

  // 특정 지점에서 스크린샷
  await page.screenshot({ path: "screenshots/campground-detail.png" });

  // 전체 페이지 스크린샷
  await page.screenshot({ path: "screenshots/full-page.png", fullPage: true });

  // 특정 요소만 스크린샷
  const card = page.locator('[data-testid="campground-card"]').first();
  await card.screenshot({ path: "screenshots/card.png" });
});
```

---

## 🚀 CI/CD 통합

### GitHub Actions 워크플로우

```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright Browsers
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm run test:e2e
        env:
          CI: true

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30

      - name: Upload videos
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: test-videos
          path: test-results/
          retention-days: 7
```

### package.json Scripts

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:report": "playwright show-report"
  }
}
```

---

## 🐛 디버깅

### VS Code 디버거 사용

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "E2E Debug",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "test:e2e:debug"],
      "console": "integratedTerminal"
    }
  ]
}
```

### Playwright Inspector

```bash
# UI 모드로 실행
npx playwright test --ui

# 특정 테스트 디버그
npx playwright test --debug login.spec.ts

# Trace Viewer
npx playwright show-trace trace.zip
```

---

## 📊 테스트 커버리지 목표

### Sprint 5 목표

| 카테고리    | 목표 커버리지 |
| ----------- | ------------- |
| 인증 플로우 | 100%          |
| 캠핑장 검색 | 80%           |
| 예약 생성   | 100%          |
| 리뷰 작성   | 80%           |
| 결제        | 100%          |

### 우선순위별 테스트

**P0 (필수)**:

- [ ] 로그인/로그아웃
- [ ] 회원가입
- [ ] 예약 생성
- [ ] 예약 취소
- [ ] 결제 플로우

**P1 (중요)**:

- [ ] 캠핑장 검색
- [ ] 캠핑장 상세
- [ ] 리뷰 작성
- [ ] 찜하기
- [ ] 프로필 수정

**P2 (선택)**:

- [ ] 필터 검색
- [ ] 정렬
- [ ] 페이지네이션
- [ ] 다크 모드

---

## 📚 참고 문서

- [Playwright 공식 문서](https://playwright.dev)
- [베스트 프랙티스](https://playwright.dev/docs/best-practices)
- [통합 테스트 가이드](../testing/integration-tests.md)
- [API 가이드](../operations/07-api-integration.md)

---

**마지막 업데이트**: 2025-01-27  
**버전**: 1.0.0 (Sprint 5 준비)
