# E2E 테스트 시나리오

> End-to-End 테스트 시나리오 모음

## 📋 목차

1. [회원가입 & 로그인](#회원가입--로그인)
2. [캠핑장 조회](#캠핑장-조회)
3. [예약 플로우](#예약-플로우)
4. [결제 플로우](#결제-플로우)
5. [예약 관리](#예약-관리)
6. [마이페이지](#마이페이지)
7. [에러 처리](#에러-처리)

---

## 🔐 회원가입 & 로그인

### TC-001: 이메일 회원가입

**전제 조건**: 앱이 실행되어 있음

**테스트 단계**:

1. 로그인 화면에서 "회원가입" 클릭
2. 이메일 입력: `test-${Date.now()}@example.com`
3. 비밀번호 입력: `Test1234!`
4. 비밀번호 확인 입력: `Test1234!`
5. 이름 입력: `테스트 사용자`
6. 전화번호 입력: `010-1234-5678`
7. 약관 동의 체크
8. "가입하기" 버튼 클릭

**예상 결과**:

- 회원가입 성공 메시지 표시
- 자동으로 홈 화면으로 이동
- 로그인 상태 확인 (헤더에 사용자 이름 표시)

**Playwright 코드**:

```typescript
test("이메일 회원가입", async ({ page }) => {
  await page.goto("/login");
  await page.click("text=회원가입");

  const email = `test-${Date.now()}@example.com`;
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', "Test1234!");
  await page.fill('input[name="passwordConfirm"]', "Test1234!");
  await page.fill('input[name="name"]', "테스트 사용자");
  await page.fill('input[name="phone"]', "010-1234-5678");
  await page.check('input[name="termsAgreed"]');

  await page.click('button[type="submit"]');

  await expect(page).toHaveURL("/");
  await expect(page.getByText("테스트 사용자")).toBeVisible();
});
```

---

### TC-002: 로그인

**전제 조건**: 회원가입된 계정 존재

**테스트 단계**:

1. 로그인 화면 이동
2. 이메일 입력: `test@example.com`
3. 비밀번호 입력: `Test1234!`
4. "로그인" 버튼 클릭

**예상 결과**:

- 로그인 성공
- 홈 화면으로 이동
- 사용자 정보 표시

**Playwright 코드**:

```typescript
test("이메일 로그인", async ({ page }) => {
  await page.goto("/login");
  await page.fill('input[name="email"]', "test@example.com");
  await page.fill('input[name="password"]', "Test1234!");
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL("/");
  await expect(page.getByTestId("user-menu")).toBeVisible();
});
```

---

### TC-003: 로그인 실패 (잘못된 비밀번호)

**테스트 단계**:

1. 로그인 화면 이동
2. 이메일 입력: `test@example.com`
3. 비밀번호 입력: `WrongPassword`
4. "로그인" 버튼 클릭

**예상 결과**:

- 에러 메시지 표시: "이메일 또는 비밀번호가 올바르지 않습니다"
- 로그인 화면 유지

```typescript
test("잘못된 비밀번호로 로그인 실패", async ({ page }) => {
  await page.goto("/login");
  await page.fill('input[name="email"]', "test@example.com");
  await page.fill('input[name="password"]', "WrongPassword");
  await page.click('button[type="submit"]');

  await expect(
    page.getByText("이메일 또는 비밀번호가 올바르지 않습니다")
  ).toBeVisible();
  await expect(page).toHaveURL("/login");
});
```

---

## 🏕️ 캠핑장 조회

### TC-101: 캠핑장 목록 조회

**전제 조건**: 로그인 상태

**테스트 단계**:

1. 홈 화면에서 "캠핑장 둘러보기" 클릭
2. 캠핑장 목록 로딩 대기
3. 첫 번째 캠핑장 카드 확인

**예상 결과**:

- 캠핑장 목록이 표시됨
- 각 카드에 이름, 지역, 가격, 이미지 포함

```typescript
test("캠핑장 목록 조회", async ({ page }) => {
  await page.goto("/");
  await page.click("text=캠핑장 둘러보기");

  await expect(page).toHaveURL("/campgrounds");

  // 로딩 완료 대기
  await page.waitForSelector('[data-testid="campground-card"]');

  // 최소 1개 이상 카드 존재
  const cards = await page.locator('[data-testid="campground-card"]').count();
  expect(cards).toBeGreaterThan(0);

  // 첫 번째 카드 정보 확인
  const firstCard = page.locator('[data-testid="campground-card"]').first();
  await expect(firstCard.getByRole("heading")).toBeVisible();
  await expect(firstCard.getByText(/원\/박/)).toBeVisible();
});
```

---

### TC-102: 캠핑장 검색 (지역 필터)

**테스트 단계**:

1. 캠핑장 목록 화면
2. 지역 필터 "강원도" 선택
3. 검색 결과 확인

**예상 결과**:

- 강원도 캠핑장만 표시

```typescript
test("지역 필터로 캠핑장 검색", async ({ page }) => {
  await page.goto("/campgrounds");

  await page.click("text=지역");
  await page.click("text=강원도");

  // URL에 쿼리 파라미터 확인
  await expect(page).toHaveURL(/region=강원도/);

  // 모든 카드가 강원도인지 확인
  const regionTexts = await page
    .locator('[data-testid="campground-region"]')
    .allTextContents();
  regionTexts.forEach((text) => {
    expect(text).toContain("강원도");
  });
});
```

---

### TC-103: 캠핑장 상세 조회

**테스트 단계**:

1. 캠핑장 목록에서 첫 번째 카드 클릭
2. 상세 정보 확인

**예상 결과**:

- 캠핑장 이름, 이미지, 주소, 편의시설 표시
- 리뷰 목록 표시
- "예약하기" 버튼 표시

```typescript
test("캠핑장 상세 조회", async ({ page }) => {
  await page.goto("/campgrounds");
  await page.waitForSelector('[data-testid="campground-card"]');

  const firstCard = page.locator('[data-testid="campground-card"]').first();
  const campgroundName = await firstCard.getByRole("heading").textContent();

  await firstCard.click();

  // 상세 페이지 확인
  await expect(page).toHaveURL(/\/campgrounds\/\d+/);
  await expect(
    page.getByRole("heading", { name: campgroundName })
  ).toBeVisible();
  await expect(page.getByTestId("image-gallery")).toBeVisible();
  await expect(page.getByTestId("facility-grid")).toBeVisible();
  await expect(page.getByRole("button", { name: "예약하기" })).toBeVisible();
});
```

---

## 📅 예약 플로우

### TC-201: 캠핑장 예약 (전체 플로우)

**전제 조건**: 로그인 상태, 캠핑장 상세 페이지

**테스트 단계**:

1. "예약하기" 버튼 클릭
2. 체크인 날짜 선택: 2주 후
3. 체크아웃 날짜 선택: 체크인 + 2박
4. 사이트 선택: "A-1"
5. 인원 선택: 성인 2명, 어린이 1명
6. "다음" 버튼 클릭
7. 예약 정보 확인
8. "예약 확정" 버튼 클릭

**예상 결과**:

- 예약 정보 입력 화면 표시
- 총 금액 계산 표시
- 예약 확정 후 결제 화면으로 이동

```typescript
test("캠핑장 예약 전체 플로우", async ({ page }) => {
  // 로그인
  await loginAsTestUser(page);

  // 캠핑장 상세로 이동
  await page.goto("/campgrounds/1");
  await page.click('button:has-text("예약하기")');

  await expect(page).toHaveURL(/\/reservations\/new/);

  // Step 1: 날짜 선택
  await page.click("text=체크인 날짜");
  const checkinDate = getDateAfterDays(14); // 2주 후
  await page.click(`[data-date="${checkinDate}"]`);

  await page.click("text=체크아웃 날짜");
  const checkoutDate = getDateAfterDays(16); // 체크인 + 2박
  await page.click(`[data-date="${checkoutDate}"]`);

  // Step 2: 사이트 선택
  await page.click("text=A-1");
  await expect(page.getByTestId("selected-site")).toHaveText("A-1");

  // Step 3: 인원 선택
  await page.click('button[aria-label="성인 증가"]');
  await page.click('button[aria-label="성인 증가"]'); // 2명
  await page.click('button[aria-label="어린이 증가"]'); // 1명

  // 다음 단계
  await page.click('button:has-text("다음")');

  // Step 4: 예약 정보 확인
  await expect(page.getByText("2박 3일")).toBeVisible();
  await expect(page.getByText("성인 2명, 어린이 1명")).toBeVisible();
  await expect(page.getByTestId("total-price")).toBeVisible();

  // 예약 확정
  await page.click('button:has-text("결제하기")');

  // 결제 화면으로 이동
  await expect(page).toHaveURL(/\/payment\//);
});
```

---

### TC-202: 날짜 유효성 검증

**테스트 단계**:

1. 예약 화면
2. 체크아웃 날짜를 체크인보다 이전으로 선택

**예상 결과**:

- 에러 메시지: "체크아웃 날짜는 체크인 이후여야 합니다"

```typescript
test("체크아웃 날짜 유효성 검증", async ({ page }) => {
  await loginAsTestUser(page);
  await page.goto("/reservations/new?campgroundId=1");

  // 체크인: 2주 후
  await page.click("text=체크인 날짜");
  await page.click(`[data-date="${getDateAfterDays(14)}"]`);

  // 체크아웃: 1주 후 (체크인보다 이전)
  await page.click("text=체크아웃 날짜");
  await page.click(`[data-date="${getDateAfterDays(7)}"]`);

  await expect(
    page.getByText("체크아웃 날짜는 체크인 이후여야 합니다")
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "다음" })).toBeDisabled();
});
```

---

## 💳 결제 플로우

### TC-301: 토스 페이먼츠 결제

**전제 조건**: 예약 정보 입력 완료

**테스트 단계**:

1. 결제 화면에서 토스 결제 위젯 확인
2. 테스트 카드 정보 입력
3. 결제 승인

**예상 결과**:

- 결제 성공
- 예약 완료 화면 표시
- 예약 번호 생성

```typescript
test("토스 페이먼츠 결제 성공", async ({ page }) => {
  // 예약 플로우 완료 후 결제 화면
  await completeReservationFlow(page);

  // 결제 페이지 확인
  await expect(page).toHaveURL(/\/payment\//);
  await expect(page.getByTestId("toss-widget")).toBeVisible();

  // Toss 테스트 결제 (iframe 내부)
  const tossFrame = page.frameLocator('[data-testid="toss-payment-frame"]');
  await tossFrame.locator('input[name="cardNumber"]').fill("4242424242424242");
  await tossFrame.locator('input[name="expiry"]').fill("12/25");
  await tossFrame.locator('input[name="cvc"]').fill("123");
  await tossFrame.locator('button:has-text("결제하기")').click();

  // 결제 완료 대기
  await expect(page).toHaveURL(/\/reservations\/\d+\/complete/);
  await expect(page.getByText("예약이 완료되었습니다")).toBeVisible();
  await expect(page.getByTestId("reservation-number")).toBeVisible();
  await expect(page.getByTestId("qr-code")).toBeVisible();
});
```

---

## 📋 예약 관리

### TC-401: 예약 내역 조회

**전제 조건**: 로그인 상태, 최소 1개 예약 존재

**테스트 단계**:

1. 하단 탭에서 "예약" 클릭
2. 예약 목록 확인

**예상 결과**:

- 예약 목록 표시
- 각 예약 카드에 캠핑장 이름, 날짜, 상태 표시

```typescript
test("예약 내역 조회", async ({ page }) => {
  await loginAsTestUser(page);
  await page.goto("/");

  await page.click('[data-tab="reservations"]');

  await expect(page).toHaveURL("/reservations");
  await page.waitForSelector('[data-testid="reservation-card"]');

  const firstReservation = page
    .locator('[data-testid="reservation-card"]')
    .first();
  await expect(firstReservation.getByTestId("campground-name")).toBeVisible();
  await expect(firstReservation.getByTestId("reservation-dates")).toBeVisible();
  await expect(
    firstReservation.getByTestId("reservation-status")
  ).toBeVisible();
});
```

---

### TC-402: 예약 취소

**테스트 단계**:

1. 예약 목록에서 예약 클릭
2. "예약 취소" 버튼 클릭
3. 취소 확인 모달에서 "확인" 클릭

**예상 결과**:

- 예약 상태가 "취소됨"으로 변경
- 취소 완료 메시지 표시

```typescript
test("예약 취소", async ({ page }) => {
  await loginAsTestUser(page);
  await page.goto("/reservations");

  const firstReservation = page
    .locator('[data-testid="reservation-card"]')
    .first();
  await firstReservation.click();

  await expect(page).toHaveURL(/\/reservations\/\d+/);

  await page.click('button:has-text("예약 취소")');

  // 취소 확인 모달
  await expect(page.getByText("정말 취소하시겠습니까?")).toBeVisible();
  await page.click('button:has-text("확인")');

  // 취소 완료
  await expect(page.getByText("예약이 취소되었습니다")).toBeVisible();
  await expect(page.getByTestId("reservation-status")).toHaveText("취소됨");
});
```

---

## 👤 마이페이지

### TC-501: 프로필 수정

**테스트 단계**:

1. 마이페이지 이동
2. "프로필 수정" 클릭
3. 이름 변경
4. "저장" 클릭

**예상 결과**:

- 변경된 이름으로 업데이트
- 성공 메시지 표시

```typescript
test("프로필 수정", async ({ page }) => {
  await loginAsTestUser(page);
  await page.goto("/my");

  await page.click('button:has-text("프로필 수정")');

  const newName = `테스트사용자${Date.now()}`;
  await page.fill('input[name="name"]', newName);
  await page.click('button:has-text("저장")');

  await expect(page.getByText("프로필이 수정되었습니다")).toBeVisible();
  await expect(page.getByTestId("user-name")).toHaveText(newName);
});
```

---

## ❌ 에러 처리

### TC-601: 네트워크 에러

**테스트 단계**:

1. 네트워크 오프라인 시뮬레이션
2. 캠핑장 목록 조회 시도

**예상 결과**:

- 에러 메시지 표시: "네트워크 연결을 확인해주세요"

```typescript
test("네트워크 에러 처리", async ({ page, context }) => {
  await loginAsTestUser(page);

  // 오프라인 모드
  await context.setOffline(true);

  await page.goto("/campgrounds");

  await expect(page.getByText("네트워크 연결을 확인해주세요")).toBeVisible();
  await expect(page.getByRole("button", { name: "다시 시도" })).toBeVisible();

  // 온라인 복구
  await context.setOffline(false);
  await page.click('button:has-text("다시 시도")');

  await page.waitForSelector('[data-testid="campground-card"]');
});
```

---

## 🔧 유틸리티 함수

```typescript
// e2e/utils/auth.ts
export async function loginAsTestUser(page: Page) {
  await page.goto("/login");
  await page.fill('input[name="email"]', "test@example.com");
  await page.fill('input[name="password"]', "Test1234!");
  await page.click('button[type="submit"]');
  await page.waitForURL("/");
}

// e2e/utils/date.ts
export function getDateAfterDays(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
}

// e2e/utils/reservation.ts
export async function completeReservationFlow(page: Page) {
  await loginAsTestUser(page);
  await page.goto("/campgrounds/1");
  await page.click('button:has-text("예약하기")');

  await page.click("text=체크인 날짜");
  await page.click(`[data-date="${getDateAfterDays(14)}"]`);
  await page.click("text=체크아웃 날짜");
  await page.click(`[data-date="${getDateAfterDays(16)}"]`);
  await page.click("text=A-1");
  await page.click('button[aria-label="성인 증가"]');
  await page.click('button[aria-label="성인 증가"]');
  await page.click('button:has-text("결제하기")');
}
```

---

## 📌 다음 단계

- [테스트 데이터 가이드](./03-test-data.md) - 테스트 데이터 준비
- [QA 체크리스트](./04-qa-checklist.md) - 수동 테스트 항목
- [테스트 전략](./01-test-strategy.md) - 테스트 전략 개요
