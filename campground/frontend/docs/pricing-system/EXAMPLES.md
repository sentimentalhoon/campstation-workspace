# 요금제 API 예제

## 목차

1. [요금제 생성 예제](#1-요금제-생성-예제)
2. [요금제 조회 예제](#2-요금제-조회-예제)
3. [요금 계산 예제](#3-요금-계산-예제)
4. [실제 사용 시나리오](#4-실제-사용-시나리오)

---

## 1. 요금제 생성 예제

### 예제 1: 기본 요금제 (연중 적용)

```json
POST /api/v1/owner/sites/123/pricing

{
  "pricingName": "기본 요금",
  "description": "연중 적용되는 기본 요금입니다",
  "ruleType": "BASE",
  "basePrice": 50000,
  "weekendPrice": 70000,
  "baseGuests": 2,
  "maxGuests": 4,
  "extraGuestFee": 10000,
  "priority": 0,
  "isActive": true
}
```

### 예제 2: 여름 성수기 요금

```json
POST /api/v1/owner/sites/123/pricing

{
  "pricingName": "여름 성수기 요금",
  "description": "7-8월 여름 휴가 시즌 특별 요금",
  "ruleType": "SEASONAL",
  "basePrice": 80000,
  "weekendPrice": 120000,
  "dayMultipliers": "{\"SATURDAY\": 1.5, \"SUNDAY\": 1.3}",
  "baseGuests": 2,
  "maxGuests": 4,
  "extraGuestFee": 15000,
  "seasonType": "PEAK",
  "startMonth": 7,
  "startDay": 1,
  "endMonth": 8,
  "endDay": 31,
  "longStayDiscountRate": 10.0,
  "longStayMinNights": 7,
  "earlyBirdDiscountRate": 15.0,
  "earlyBirdMinDays": 30,
  "priority": 100,
  "isActive": true
}
```

### 예제 3: 겨울 비수기 할인

```json
POST /api/v1/owner/sites/123/pricing

{
  "pricingName": "겨울 비수기 할인",
  "description": "12-2월 겨울 시즌 특가",
  "ruleType": "SEASONAL",
  "basePrice": 35000,
  "weekendPrice": 45000,
  "baseGuests": 2,
  "maxGuests": 4,
  "extraGuestFee": 8000,
  "seasonType": "LOW",
  "startMonth": 12,
  "startDay": 1,
  "endMonth": 2,
  "endDay": 28,
  "longStayDiscountRate": 15.0,
  "longStayMinNights": 5,
  "priority": 80,
  "isActive": true
}
```

### 예제 4: 추석 연휴 특별 요금

```json
POST /api/v1/owner/sites/123/pricing

{
  "pricingName": "추석 연휴 특별 요금",
  "description": "2025년 추석 연휴 기간 (10/5-10/8)",
  "ruleType": "DATE_RANGE",
  "basePrice": 150000,
  "weekendPrice": 150000,
  "baseGuests": 2,
  "maxGuests": 4,
  "extraGuestFee": 20000,
  "startMonth": 10,
  "startDay": 5,
  "endMonth": 10,
  "endDay": 8,
  "priority": 150,
  "isActive": true
}
```

### 예제 5: 평일 특가 (요일별 배율 활용)

```json
POST /api/v1/owner/sites/123/pricing

{
  "pricingName": "평일 특가",
  "description": "월-목 평일 할인 요금",
  "ruleType": "BASE",
  "basePrice": 50000,
  "dayMultipliers": "{\"MONDAY\": 0.8, \"TUESDAY\": 0.8, \"WEDNESDAY\": 0.8, \"THURSDAY\": 0.8}",
  "baseGuests": 2,
  "maxGuests": 4,
  "extraGuestFee": 10000,
  "priority": 20,
  "isActive": true
}
```

---

## 2. 요금제 조회 예제

### 사이트별 요금제 목록

```http
GET /api/v1/owner/sites/123/pricing
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**응답:**

```json
{
  "success": true,
  "message": "요금제 목록 조회 성공",
  "data": [
    {
      "id": 5,
      "siteId": 123,
      "siteName": "A-01",
      "pricingName": "추석 연휴 특별 요금",
      "description": "2025년 추석 연휴 기간 (10/5-10/8)",
      "ruleType": "DATE_RANGE",
      "basePrice": 150000,
      "weekendPrice": 150000,
      "baseGuests": 2,
      "maxGuests": 4,
      "extraGuestFee": 20000,
      "startMonth": 10,
      "startDay": 5,
      "endMonth": 10,
      "endDay": 8,
      "priority": 150,
      "isActive": true,
      "createdAt": "2025-01-01T10:00:00",
      "updatedAt": "2025-01-01T10:00:00"
    },
    {
      "id": 2,
      "siteId": 123,
      "siteName": "A-01",
      "pricingName": "여름 성수기 요금",
      "description": "7-8월 여름 휴가 시즌 특별 요금",
      "ruleType": "SEASONAL",
      "basePrice": 80000,
      "weekendPrice": 120000,
      "dayMultipliers": "{\"SATURDAY\": 1.5, \"SUNDAY\": 1.3}",
      "baseGuests": 2,
      "maxGuests": 4,
      "extraGuestFee": 15000,
      "seasonType": "PEAK",
      "startMonth": 7,
      "startDay": 1,
      "endMonth": 8,
      "endDay": 31,
      "longStayDiscountRate": 10.0,
      "longStayMinNights": 7,
      "earlyBirdDiscountRate": 15.0,
      "earlyBirdMinDays": 30,
      "priority": 100,
      "isActive": true,
      "createdAt": "2025-01-01T09:00:00",
      "updatedAt": "2025-01-01T09:00:00"
    },
    {
      "id": 1,
      "siteId": 123,
      "siteName": "A-01",
      "pricingName": "기본 요금",
      "description": "연중 적용되는 기본 요금입니다",
      "ruleType": "BASE",
      "basePrice": 50000,
      "weekendPrice": 70000,
      "baseGuests": 2,
      "maxGuests": 4,
      "extraGuestFee": 10000,
      "priority": 0,
      "isActive": true,
      "createdAt": "2025-01-01T08:00:00",
      "updatedAt": "2025-01-01T08:00:00"
    }
  ]
}
```

### Owner의 모든 요금제

```http
GET /api/v1/owner/pricing
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 3. 요금 계산 예제

### 예제 1: 평일 2박 3일 (기본 인원)

```http
GET /api/v1/pricing/calculate?siteId=123&checkInDate=2025-06-10&checkOutDate=2025-06-12&numberOfGuests=2
```

**응답:**

```json
{
  "success": true,
  "message": "요금 계산 성공",
  "data": {
    "siteId": 123,
    "checkInDate": "2025-06-10",
    "checkOutDate": "2025-06-12",
    "numberOfNights": 2,
    "numberOfGuests": 2,
    "dailyPrices": [
      {
        "date": "2025-06-10",
        "basePrice": 50000,
        "appliedPrice": 50000,
        "pricingName": "기본 요금"
      },
      {
        "date": "2025-06-11",
        "basePrice": 50000,
        "appliedPrice": 50000,
        "pricingName": "기본 요금"
      }
    ],
    "subtotal": 100000,
    "extraGuestFee": 0,
    "discounts": [],
    "totalDiscount": 0,
    "finalPrice": 100000
  }
}
```

### 예제 2: 여름 성수기 주말 (추가 인원)

```http
GET /api/v1/pricing/calculate?siteId=123&checkInDate=2025-07-25&checkOutDate=2025-07-27&numberOfGuests=4
```

**응답:**

```json
{
  "success": true,
  "message": "요금 계산 성공",
  "data": {
    "siteId": 123,
    "checkInDate": "2025-07-25",
    "checkOutDate": "2025-07-27",
    "numberOfNights": 2,
    "numberOfGuests": 4,
    "dailyPrices": [
      {
        "date": "2025-07-25",
        "basePrice": 80000,
        "appliedPrice": 120000,
        "pricingName": "여름 성수기 요금"
      },
      {
        "date": "2025-07-26",
        "basePrice": 80000,
        "appliedPrice": 180000,
        "pricingName": "여름 성수기 요금 (토요일 배율 1.5)"
      }
    ],
    "subtotal": 300000,
    "extraGuestFee": 30000,
    "discounts": [],
    "totalDiscount": 0,
    "finalPrice": 330000
  }
}
```

### 예제 3: 장기 숙박 + 조기 예약 할인

```http
GET /api/v1/pricing/calculate?siteId=123&checkInDate=2025-08-01&checkOutDate=2025-08-08&numberOfGuests=2
```

**계산 조건:**

- 체크인: 2025-08-01 (45일 전 예약 가정)
- 숙박: 7박 8일

**응답:**

```json
{
  "success": true,
  "message": "요금 계산 성공",
  "data": {
    "siteId": 123,
    "checkInDate": "2025-08-01",
    "checkOutDate": "2025-08-08",
    "numberOfNights": 7,
    "numberOfGuests": 2,
    "dailyPrices": [
      {
        "date": "2025-08-01",
        "basePrice": 80000,
        "appliedPrice": 120000,
        "pricingName": "여름 성수기 요금 (금요일)"
      },
      {
        "date": "2025-08-02",
        "basePrice": 80000,
        "appliedPrice": 180000,
        "pricingName": "여름 성수기 요금 (토요일 배율 1.5)"
      },
      {
        "date": "2025-08-03",
        "basePrice": 80000,
        "appliedPrice": 156000,
        "pricingName": "여름 성수기 요금 (일요일 배율 1.3)"
      },
      {
        "date": "2025-08-04",
        "basePrice": 80000,
        "appliedPrice": 80000,
        "pricingName": "여름 성수기 요금 (평일)"
      },
      {
        "date": "2025-08-05",
        "basePrice": 80000,
        "appliedPrice": 80000,
        "pricingName": "여름 성수기 요금 (평일)"
      },
      {
        "date": "2025-08-06",
        "basePrice": 80000,
        "appliedPrice": 80000,
        "pricingName": "여름 성수기 요금 (평일)"
      },
      {
        "date": "2025-08-07",
        "basePrice": 80000,
        "appliedPrice": 80000,
        "pricingName": "여름 성수기 요금 (평일)"
      }
    ],
    "subtotal": 776000,
    "extraGuestFee": 0,
    "discounts": [
      {
        "type": "LONG_STAY",
        "name": "장기 숙박 할인 (7박 이상)",
        "amount": -77600,
        "rate": 10.0
      },
      {
        "type": "EARLY_BIRD",
        "name": "조기 예약 할인 (30일 전)",
        "amount": -116400,
        "rate": 15.0
      }
    ],
    "totalDiscount": 194000,
    "finalPrice": 582000
  }
}
```

### 예제 4: 추석 연휴 (우선순위 최상위)

```http
GET /api/v1/pricing/calculate?siteId=123&checkInDate=2025-10-05&checkOutDate=2025-10-08&numberOfGuests=2
```

**응답:**

```json
{
  "success": true,
  "message": "요금 계산 성공",
  "data": {
    "siteId": 123,
    "checkInDate": "2025-10-05",
    "checkOutDate": "2025-10-08",
    "numberOfNights": 3,
    "numberOfGuests": 2,
    "dailyPrices": [
      {
        "date": "2025-10-05",
        "basePrice": 150000,
        "appliedPrice": 150000,
        "pricingName": "추석 연휴 특별 요금"
      },
      {
        "date": "2025-10-06",
        "basePrice": 150000,
        "appliedPrice": 150000,
        "pricingName": "추석 연휴 특별 요금"
      },
      {
        "date": "2025-10-07",
        "basePrice": 150000,
        "appliedPrice": 150000,
        "pricingName": "추석 연휴 특별 요금"
      }
    ],
    "subtotal": 450000,
    "extraGuestFee": 0,
    "discounts": [],
    "totalDiscount": 0,
    "finalPrice": 450000
  }
}
```

---

## 4. 실제 사용 시나리오

### 시나리오 1: 새 캠핑장 오픈 (기본 요금제만)

```javascript
// 1단계: 기본 요금제 생성
await pricingApi.createSitePricing(siteId, {
  pricingName: "기본 요금",
  ruleType: "BASE",
  basePrice: 50000,
  weekendPrice: 70000,
  baseGuests: 2,
  maxGuests: 4,
  extraGuestFee: 10000,
  priority: 0,
  isActive: true,
});
```

### 시나리오 2: 시즌별 요금제 추가

```javascript
// 여름 성수기
await pricingApi.createSitePricing(siteId, {
  pricingName: "여름 성수기",
  ruleType: "SEASONAL",
  basePrice: 80000,
  weekendPrice: 120000,
  seasonType: "PEAK",
  startMonth: 7,
  startDay: 1,
  endMonth: 8,
  endDay: 31,
  baseGuests: 2,
  maxGuests: 4,
  extraGuestFee: 15000,
  longStayDiscountRate: 10,
  longStayMinNights: 7,
  priority: 100,
  isActive: true,
});

// 겨울 비수기
await pricingApi.createSitePricing(siteId, {
  pricingName: "겨울 비수기",
  ruleType: "SEASONAL",
  basePrice: 35000,
  weekendPrice: 45000,
  seasonType: "LOW",
  startMonth: 12,
  startDay: 1,
  endMonth: 2,
  endDay: 28,
  baseGuests: 2,
  maxGuests: 4,
  extraGuestFee: 8000,
  longStayDiscountRate: 15,
  longStayMinNights: 5,
  priority: 80,
  isActive: true,
});
```

### 시나리오 3: 특별 이벤트 요금 임시 추가

```javascript
// 크리스마스 특가
await pricingApi.createSitePricing(siteId, {
  pricingName: "크리스마스 특가",
  ruleType: "SPECIAL_EVENT",
  basePrice: 40000,
  weekendPrice: 40000,
  startMonth: 12,
  startDay: 24,
  endMonth: 12,
  endDay: 26,
  baseGuests: 2,
  maxGuests: 4,
  extraGuestFee: 10000,
  priority: 120,
  isActive: true,
});

// 이벤트 종료 후 비활성화
await pricingApi.updateSitePricing(siteId, pricingId, {
  ...existingData,
  isActive: false,
});
```

### 시나리오 4: 요금 미리보기 (예약 페이지)

```javascript
// 사용자가 날짜와 인원 선택 시
const handleDateChange = async () => {
  if (checkInDate && checkOutDate && numberOfGuests) {
    const priceBreakdown = await pricingApi.calculatePrice(
      siteId,
      checkInDate,
      checkOutDate,
      numberOfGuests
    );

    // 결과 표시
    console.log(`총 ${priceBreakdown.numberOfNights}박`);
    console.log(
      `최종 결제 금액: ₩${priceBreakdown.finalPrice.toLocaleString()}`
    );

    if (priceBreakdown.discounts.length > 0) {
      console.log("적용된 할인:");
      priceBreakdown.discounts.forEach((discount) => {
        console.log(
          `- ${discount.name}: -₩${discount.amount.toLocaleString()}`
        );
      });
    }
  }
};
```

### 시나리오 5: 우선순위 조정

```javascript
// 기본 요금제 (우선순위: 0) - 항상 적용
// 평일 특가 (우선순위: 20) - 월-목 적용
// 겨울 비수기 (우선순위: 80) - 12-2월 적용
// 여름 성수기 (우선순위: 100) - 7-8월 적용
// 추석 연휴 (우선순위: 150) - 10/5-10/8 적용

// 2025-07-26 (토요일, 여름)의 경우:
// - 기본 요금제 매칭 (0)
// - 여름 성수기 매칭 (100) ✓ 선택됨 (우선순위 높음)

// 2025-10-06 (추석 연휴)의 경우:
// - 기본 요금제 매칭 (0)
// - 추석 연휴 매칭 (150) ✓ 선택됨 (우선순위 최상위)
```

---

## 참고: 요금 계산 로직

1. **날짜별 요금 적용**
   - 각 날짜마다 적용 가능한 모든 요금제 검색
   - 우선순위가 가장 높은 요금제 선택
   - 요일별 배율 적용

2. **추가 인원 요금 계산**
   - 총 인원 > 기준 인원이면 추가 요금 발생
   - 추가 요금 = (총 인원 - 기준 인원) × 추가 인원당 요금 × 숙박일수

3. **할인 적용**
   - 장기 숙박 할인: 총 박수 ≥ 최소 박수
   - 연박 할인: 총 박수 ≥ 최소 박수
   - 조기 예약 할인: 예약일로부터 체크인까지 일수 ≥ 최소 일수
   - 여러 할인 동시 적용 가능

4. **최종 금액**
   ```
   최종 금액 = (일별 요금 합계) + (추가 인원 요금) - (총 할인 금액)
   ```
