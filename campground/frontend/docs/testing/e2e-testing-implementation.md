# E2E 테스트 구현 (Phase 7)

## 📋 개요

Playwright를 사용하여 예약-결제 시스템의 전체 플로우를 검증하는 E2E 테스트를 구현했습니다.

**작업 일자**: 2024-11-18
**관련 Phase**: Phase 7 - E2E Testing
**테스트 프레임워크**: Playwright

## 🎯 테스트 범위

### 1. 예약-결제 통합 플로우

**파일**: `e2e/tests/reservations/reservation-payment-flow.spec.ts`

#### 테스트 시나리오:

1. **캠핑장 → 예약 페이지 이동**
   - 캠핑장 상세에서 "예약하기" 버튼 클릭
   - campgroundId가 URL에 포함되는지 확인

2. **가격 계산 검증 (Phase 1)**

   ```typescript
   // 할인이 subtotal에 적용되는지 확인
   const expectedTotal = basePrice + surcharges + fees - discount;
   expect(Math.abs(totalPrice - expectedTotal)).toBeLessThan(1);
   ```

3. **URL 파라미터 최적화 검증 (Phase 3-4)**

   ```typescript
   // URL에 2개 파라미터만 있어야 함
   expect(url.searchParams.has("reservationId")).toBeTruthy();
   expect(url.searchParams.has("paymentId")).toBeTruthy();
   expect(url.searchParams.size).toBe(2);
   ```

4. **API 기반 데이터 페칭 검증**
   - 결제 페이지에서 `/api/reservations/{id}` 호출 확인
   - 페이지 새로고침 시 데이터 유지 확인

#### 에러 핸들링 시나리오 (Phase 6):

1. **404 에러**: 존재하지 않는 예약 조회
   - "찾을 수 없습니다" 메시지 표시
   - "캠핑장 목록으로" 버튼 표시

2. **네트워크 오류**: 오프라인 상태 시뮬레이션
   - 에러 메시지 표시
   - "다시 시도" 버튼 표시
   - 네트워크 복구 후 재시도 성공

3. **서버 오류 (5xx)**: 자동 재시도

   ```typescript
   // 처음 2번은 500 에러, 3번째 성공
   await page.route("**/api/reservations/*", (route) => {
     if (requestCount <= 2) {
       route.fulfill({ status: 500 });
     } else {
       route.continue();
     }
   });
   ```

   - React Query가 최대 2번 재시도
   - 3번째 시도에서 성공

4. **날짜 충돌 (409)**: 이미 예약된 날짜
   - "이미 예약된 날짜입니다" 메시지
   - 재시도 안함 (4xx 에러)

5. **인증 오류 (401)**: 로그인 필요
   - "로그인이 필요합니다" 메시지
   - 로그인 페이지로 리다이렉트

#### 가격 계산 정확성:

1. **주말 요금제**: 금요일-일요일 선택 시 할증료 적용
2. **추가 인원 요금**: 기본 인원 초과 시 추가 요금
3. **할인 적용**: subtotal에 할인 적용 확인

### 2. 결제 프로세스

**파일**: `e2e/tests/reservations/payment-process.spec.ts`

#### 결제 성공 플로우:

1. **결제 승인 후 성공 페이지**
   - Toss 결제 승인 시뮬레이션
   - `/payment/success` 리다이렉트
   - 성공 메시지 표시

2. **금액 이중 검증 (Phase 5)**

   ```typescript
   // 백엔드 검증 API 호출 확인
   await page.waitForResponse((response) =>
     response.url().includes("/api/payments/verify")
   );
   ```

3. **예약 상세 페이지 이동**
   - "예약 확인" 버튼 클릭
   - 예약 상태 "확정" 확인

#### 결제 실패 처리:

1. **결제 취소**: `/payment/fail` 리다이렉트
2. **금액 불일치**: 400 에러, "금액이 일치하지 않습니다" 메시지
3. **재시도 가능**: "다시 시도" 버튼으로 결제 페이지 복귀
4. **Toss API 오류**: 서버 오류 메시지 표시

#### 결제 금액 검증 (Phase 5 핵심):

1. **예약 금액 = 결제 금액**

   ```typescript
   const displayedAmount = await getDisplayedAmount(page);
   expect(displayedAmount).toBe(reservation.totalAmount);

   const tossAmount = await getTossWidgetAmount(page);
   expect(tossAmount).toBe(reservation.totalAmount);
   ```

2. **백엔드 금액 검증**

   ```typescript
   // 결제 검증 요청 가로채기
   await page.route("**/api/payments/verify", async (route) => {
     verifyRequest = await request.postDataJSON();
   });

   expect(verifyRequest.amount).toBe(amount);
   ```

3. **금액 조작 차단**

   ```typescript
   const manipulatedAmount = originalAmount - 10000; // 시도

   // 금액 불일치 에러 발생
   await expect(errorMessage).toContainText(/금액.*불일치/i);
   ```

4. **허용 오차 범위 (±100원)**
   ```typescript
   const slightlyDifferentAmount = originalAmount + 50; // 허용
   await expect(successMessage).toBeVisible();
   ```

#### 결제 페이지 접근 제어:

1. **본인 예약만 결제 가능**: 403 Forbidden
2. **완료된 결제 재진행 불가**: 예약 상세로 리다이렉트

## 🛠️ 테스트 구조

### 파일 구조

```
e2e/
├── tests/
│   └── reservations/
│       ├── reservation.spec.ts (기존)
│       ├── reservation-payment-flow.spec.ts (신규) ← 통합 플로우
│       └── payment-process.spec.ts (신규) ← 결제 상세
├── pages/
│   ├── ReservationPage.ts
│   ├── CampgroundPage.ts
│   └── LoginPage.ts
└── fixtures/
```

### 헬퍼 함수

#### 날짜 선택

```typescript
async function selectDates(page: Page, checkIn: Date, checkOut: Date) {
  await page.locator('[data-testid="check-in-date"]').fill(formatDate(checkIn));
  await page
    .locator('[data-testid="check-out-date"]')
    .fill(formatDate(checkOut));
}
```

#### 인원 선택

```typescript
async function selectGuests(page: Page, adults: number, children: number) {
  await page.locator('[data-testid="adult-count"]').fill(adults.toString());
  await page.locator('[data-testid="child-count"]').fill(children.toString());
}
```

#### 가격 파싱

```typescript
function parsePrice(text: string): number {
  // "123,456원" → 123456
  return parseInt(text.replace(/[^\d]/g, "")) || 0;
}
```

#### 평일/주말 날짜 생성

```typescript
function getNextWeekday(daysFromNow: number = 7): Date {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);

  // 주말이면 월요일로 이동
  while (date.getDay() === 0 || date.getDay() === 6) {
    date.setDate(date.getDate() + 1);
  }

  return date;
}
```

## 🧪 테스트 실행

### 전체 E2E 테스트

```bash
npm run test:e2e
```

### 특정 파일만 실행

```bash
npx playwright test reservation-payment-flow.spec.ts
```

### UI 모드로 실행

```bash
npm run test:e2e:ui
```

### 디버그 모드

```bash
npm run test:e2e:debug
```

### 헤드리스 모드 해제

```bash
npm run test:e2e:headed
```

## 📊 테스트 커버리지

### Phase별 검증 항목

| Phase     | 검증 항목                      | 테스트 수 |
| --------- | ------------------------------ | --------- |
| Phase 1   | 가격 계산 (할인 subtotal 적용) | 3         |
| Phase 2   | expectedAmount 검증            | 통합됨    |
| Phase 3-4 | URL 파라미터 최적화, API 페칭  | 3         |
| Phase 5   | 결제 금액 재검증               | 5         |
| Phase 6   | 에러 핸들링                    | 5         |

**총 테스트 케이스**: 20+

### 시나리오 분류

- **정상 플로우**: 8개
- **에러 케이스**: 8개
- **보안 검증**: 4개

## 🚨 주의사항

### 1. 백엔드 연동 필요

현재 테스트는 **시뮬레이션**으로 작성되었습니다. 실제 환경에서는:

- `createReservation()` → 실제 API 호출
- `createPendingReservation()` → 실제 DB 데이터
- `simulateTossPaymentSuccess()` → Toss 테스트 환경

### 2. 인증 처리

```typescript
test.beforeEach(async ({ page }) => {
  // 로그인 필요 시 여기서 처리
  await loginAsUser(page, {
    email: "test@example.com",
    password: "password123",
  });
});
```

### 3. 테스트 데이터 초기화

각 테스트 전에 데이터베이스 초기화 필요:

```typescript
test.beforeAll(async () => {
  await resetDatabase();
});
```

### 4. Toss Payments 테스트 환경

Toss에서 제공하는 테스트 키와 샌드박스 환경 사용:

```typescript
// playwright.config.ts
use: {
  baseURL: process.env.BASE_URL || "http://localhost:3000",
  extraHTTPHeaders: {
    "X-Test-Mode": "true",
  },
},
```

## 🔍 테스트 디버깅

### 스크린샷 확인

실패한 테스트는 자동으로 스크린샷 저장:

```
test-results/
└── reservation-payment-flow-spec-ts/
    └── screenshot-on-failure.png
```

### 비디오 재생

```
playwright-report/
└── videos/
    └── test-run.webm
```

### Trace 뷰어

```bash
npx playwright show-trace test-results/trace.zip
```

## ✅ 다음 단계 (Phase 8)

1. **실제 백엔드 연동**
   - Mock → 실제 API 호출
   - 테스트 데이터베이스 구축

2. **CI/CD 통합**
   - GitHub Actions 워크플로우 추가
   - PR마다 E2E 테스트 자동 실행

3. **테스트 안정화**
   - Flaky 테스트 제거
   - 타임아웃 최적화
   - 재시도 전략 개선

4. **커버리지 확대**
   - 사용자 권한별 테스트
   - 쿠폰/할인 시나리오
   - 대량 예약 처리

## 📚 참고 자료

- [Playwright 공식 문서](https://playwright.dev/)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Page Object Model](https://playwright.dev/docs/pom)
- [Test Fixtures](https://playwright.dev/docs/test-fixtures)

---

**작성자**: GitHub Copilot  
**최종 수정**: 2024-11-18  
**관련 문서**:

- `error-handling-improvements.md`
- `payment-verification.md`
- `payment-reservation-workflow.md`
