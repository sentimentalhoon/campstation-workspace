# 테스트 전략

> 전체 테스트 전략 및 접근 방법

## 📋 목차

1. [테스트 피라미드](#테스트-피라미드)
2. [테스트 유형](#테스트-유형)
3. [테스트 도구](#테스트-도구)
4. [테스트 커버리지](#테스트-커버리지)
5. [CI/CD 통합](#cicd-통합)

---

## 🔺 테스트 피라미드

```
        /\
       /  \
      / E2E \         < 소수 (느림, 비용 높음)
     /______\
    /        \
   /  통합    \       < 중간
  /____________\
 /              \
/   단위 테스트   \    < 다수 (빠름, 비용 낮음)
/__________________\
```

### 테스트 비율 목표

| 테스트 유형     | 비율 | 개수 (예상) | 실행 시간 |
| --------------- | ---- | ----------- | --------- |
| **단위 테스트** | 70%  | ~200개      | < 10초    |
| **통합 테스트** | 20%  | ~60개       | < 30초    |
| **E2E 테스트**  | 10%  | ~30개       | < 5분     |

---

## 🧪 테스트 유형

### 1. 단위 테스트 (Unit Tests)

**목적**: 개별 함수, 컴포넌트, 유틸리티 테스트

**대상**:

- UI 컴포넌트 (Button, Input, Card 등)
- 유틸리티 함수 (formatDate, validateEmail 등)
- Custom Hooks (useAuth, useCampgrounds 등)
- API 클라이언트 함수

**도구**: Jest + React Testing Library

**예시**:

```typescript
// __tests__/utils/format.test.ts
import { formatPrice, formatDate } from "@/lib/utils/format";

describe("formatPrice", () => {
  it("should format number to Korean won", () => {
    expect(formatPrice(10000)).toBe("10,000원");
    expect(formatPrice(1234567)).toBe("1,234,567원");
  });

  it("should handle zero", () => {
    expect(formatPrice(0)).toBe("0원");
  });
});

describe("formatDate", () => {
  it("should format date to YYYY-MM-DD", () => {
    const date = new Date("2024-01-15");
    expect(formatDate(date)).toBe("2024-01-15");
  });
});
```

```typescript
// __tests__/components/ui/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/Button';

describe('Button', () => {
  it('should render children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Click me</Button>);

    fireEvent.click(screen.getByText('Click me'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByText('Click me')).toBeDisabled();
  });
});
```

---

### 2. 통합 테스트 (Integration Tests)

**목적**: 여러 컴포넌트/모듈 간 상호작용 테스트

**대상**:

- API 호출 + 상태 업데이트
- Context Provider + Consumer
- 복잡한 컴포넌트 조합
- React Query + API 통합

**도구**: Jest + MSW (Mock Service Worker)

**예시**:

```typescript
// __tests__/hooks/useCampgrounds.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { useCampgrounds } from '@/hooks/features/useCampgrounds';

// Mock API Server
const server = setupServer(
  rest.get('/api/v1/campgrounds', (req, res, ctx) => {
    return res(ctx.json({
      content: [
        { id: 1, name: '테스트 캠핑장', region: '강원도' },
        { id: 2, name: '테스트 캠핑장2', region: '경기도' },
      ],
      totalElements: 2,
    }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('useCampgrounds', () => {
  it('should fetch campgrounds successfully', async () => {
    const queryClient = new QueryClient();
    const wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );

    const { result } = renderHook(() => useCampgrounds(), { wrapper });

    // 로딩 상태
    expect(result.current.isLoading).toBe(true);

    // 데이터 로딩 완료 대기
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // 데이터 검증
    expect(result.current.data).toHaveLength(2);
    expect(result.current.data[0].name).toBe('테스트 캠핑장');
  });
});
```

---

### 3. E2E 테스트 (End-to-End Tests)

**목적**: 실제 사용자 플로우 테스트

**대상**:

- 회원가입 → 로그인 → 예약 → 결제 플로우
- 예약 조회 → 취소 플로우
- 검색 → 상세 → 예약 플로우

**도구**: Playwright

**예시**:

```typescript
// e2e/reservation-flow.spec.ts
import { test, expect } from "@playwright/test";

test.describe("예약 플로우", () => {
  test("사용자가 캠핑장을 예약할 수 있다", async ({ page }) => {
    // 1. 로그인
    await page.goto("/login");
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "password123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL("/");

    // 2. 캠핑장 검색
    await page.goto("/campgrounds");
    await page.click("text=테스트 캠핑장");
    await expect(page).toHaveURL(/\/campgrounds\/\d+/);

    // 3. 예약 시작
    await page.click("text=예약하기");
    await expect(page).toHaveURL(/\/reservations\/new/);

    // 4. 날짜 선택
    await page.click("text=체크인 날짜");
    await page.click('[data-date="2024-01-20"]');
    await page.click("text=체크아웃 날짜");
    await page.click('[data-date="2024-01-22"]');

    // 5. 사이트 선택
    await page.click("text=A-1");

    // 6. 인원 선택
    await page.click('button[aria-label="성인 증가"]');
    await page.click('button[aria-label="성인 증가"]');

    // 7. 다음 단계
    await page.click("text=다음");

    // 8. 예약 정보 확인
    await expect(page.getByText("2박 3일")).toBeVisible();
    await expect(page.getByText("성인 2명")).toBeVisible();

    // 9. 결제 진행
    await page.click("text=결제하기");
    await expect(page).toHaveURL(/\/payment\//);
  });
});
```

---

## 🛠️ 테스트 도구

### Frontend

| 도구                            | 용도                     | 버전    |
| ------------------------------- | ------------------------ | ------- |
| **Jest**                        | 단위 테스트 러너         | ^29.0.0 |
| **React Testing Library**       | 컴포넌트 테스트          | ^14.0.0 |
| **MSW**                         | API Mocking              | ^2.0.0  |
| **Playwright**                  | E2E 테스트               | ^1.40.0 |
| **@testing-library/user-event** | 사용자 이벤트 시뮬레이션 | ^14.0.0 |

**설치**:

```bash
npm install -D jest @testing-library/react @testing-library/jest-dom \
  @testing-library/user-event msw playwright @playwright/test
```

---

### Backend

| 도구                 | 용도               |
| -------------------- | ------------------ |
| **JUnit 5**          | 단위/통합 테스트   |
| **Mockito**          | Mock 객체 생성     |
| **Spring Boot Test** | 통합 테스트        |
| **Testcontainers**   | 테스트 DB 컨테이너 |
| **RestAssured**      | API 테스트         |

---

### 테스트 환경 설정

**jest.config.js**:

```javascript
module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/*.stories.tsx",
  ],
  coverageThresholds: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
```

**jest.setup.js**:

```javascript
import "@testing-library/jest-dom";
import { server } from "./src/mocks/server";

// MSW 서버 시작
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

**playwright.config.ts**:

```typescript
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
```

---

## 📊 테스트 커버리지

### 목표 커버리지

| 항목                | 목표 | 현재 | 상태 |
| ------------------- | ---- | ---- | ---- |
| **라인 커버리지**   | 80%  | -    | ⏳   |
| **함수 커버리지**   | 80%  | -    | ⏳   |
| **브랜치 커버리지** | 70%  | -    | ⏳   |
| **구문 커버리지**   | 80%  | -    | ⏳   |

### 우선순위별 커버리지

| 우선순위      | 대상                    | 목표 커버리지 |
| ------------- | ----------------------- | ------------- |
| **P0 (필수)** | 인증, 예약, 결제        | 90%+          |
| **P1 (중요)** | 캠핑장 조회, 마이페이지 | 80%+          |
| **P2 (보통)** | 리뷰, 즐겨찾기          | 70%+          |
| **P3 (낮음)** | UI 컴포넌트             | 60%+          |

### 커버리지 확인

```bash
# Frontend 커버리지 리포트
npm test -- --coverage

# HTML 리포트 생성
npm test -- --coverage --coverageReporters=html

# 특정 파일만 테스트
npm test -- src/lib/utils/format.test.ts --coverage
```

---

## 🔄 CI/CD 통합

### GitHub Actions Workflow

**.github/workflows/test.yml**:

```yaml
name: Test

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  frontend-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci
        working-directory: ./frontend

      - name: Run unit tests
        run: npm test -- --coverage
        working-directory: ./frontend

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./frontend/coverage/lcov.info

  e2e-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "20"

      - name: Install dependencies
        run: npm ci
        working-directory: ./frontend

      - name: Install Playwright
        run: npx playwright install --with-deps
        working-directory: ./frontend

      - name: Run E2E tests
        run: npm run test:e2e
        working-directory: ./frontend

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: frontend/playwright-report/

  backend-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Java
        uses: actions/setup-java@v3
        with:
          distribution: "temurin"
          java-version: "21"

      - name: Run backend tests
        run: ./gradlew test
        working-directory: ./backend

      - name: Upload test report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: backend-test-report
          path: backend/build/reports/tests/
```

---

## 📝 테스트 작성 가이드

### 1. 테스트 네이밍

```typescript
// ✅ 좋은 예: 명확하고 구체적
it("should show error message when email is invalid", () => {});
it("should disable submit button when form is invalid", () => {});

// ❌ 나쁜 예: 모호함
it("should work", () => {});
it("test email validation", () => {});
```

### 2. AAA 패턴 (Arrange, Act, Assert)

```typescript
it("should calculate total price correctly", () => {
  // Arrange (준비)
  const nights = 2;
  const pricePerNight = 50000;

  // Act (실행)
  const total = calculateTotalPrice(nights, pricePerNight);

  // Assert (검증)
  expect(total).toBe(100000);
});
```

### 3. 단일 책임 원칙

```typescript
// ✅ 좋은 예: 하나의 테스트는 하나의 기능만
it("should format price with commas", () => {
  expect(formatPrice(10000)).toBe("10,000원");
});

it("should handle zero price", () => {
  expect(formatPrice(0)).toBe("0원");
});

// ❌ 나쁜 예: 여러 기능을 한 테스트에
it("should format price correctly", () => {
  expect(formatPrice(10000)).toBe("10,000원");
  expect(formatPrice(0)).toBe("0원");
  expect(formatPrice(-100)).toBe("0원"); // 음수 처리는 별도 테스트
});
```

---

## 📌 Sprint별 테스트 계획

### Sprint 1 (Detail + Reservation Basic)

**단위 테스트**:

- [ ] `CampgroundCard` 컴포넌트
- [ ] `Calendar` 컴포넌트
- [ ] `SiteSelector` 컴포넌트
- [ ] `formatDate` 유틸

**통합 테스트**:

- [ ] `useCampgroundDetail` + API
- [ ] `useReservation` + 폼 검증

**E2E 테스트**:

- [ ] 캠핑장 상세 조회
- [ ] 예약 기본 플로우 (날짜 선택까지)

---

### Sprint 2 (Payment + Management)

**단위 테스트**:

- [ ] `PriceBreakdown` 컴포넌트
- [ ] `ReservationCard` 컴포넌트
- [ ] `calculatePrice` 유틸

**통합 테스트**:

- [ ] `usePayment` + Toss API
- [ ] `useReservations` + 목록 조회

**E2E 테스트**:

- [ ] 전체 예약 + 결제 플로우
- [ ] 예약 취소 플로우

---

### Sprint 3 (Navigation + My Page)

**단위 테스트**:

- [ ] `BottomTabNav` 컴포넌트
- [ ] `ProfileForm` 컴포넌트

**E2E 테스트**:

- [ ] 탭 네비게이션
- [ ] 프로필 수정

---

### Sprint 4 (Testing & Optimization)

**테스트 완성**:

- [ ] 전체 E2E 시나리오 작성
- [ ] 커버리지 80% 달성
- [ ] 성능 테스트 (Lighthouse)
- [ ] 최종 QA

---

## 📌 다음 단계

- [E2E 테스트 시나리오](./02-e2e-scenarios.md) - 구체적인 E2E 테스트 작성
- [테스트 데이터 가이드](./03-test-data.md) - 테스트 데이터 준비
- [QA 체크리스트](./04-qa-checklist.md) - 배포 전 점검
