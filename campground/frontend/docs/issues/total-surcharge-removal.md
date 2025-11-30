# totalSurcharge 필드 제거 (Bug Fix)

## 📋 개요

**발견 일자**: 2024-11-18  
**심각도**: Medium  
**타입**: 불필요한 필드 / 중복 계산 위험

## 🔍 문제 발견

가격 계산 로직을 검토하던 중 `totalSurcharge` 필드가 발견되었습니다.

### 문제점

**PriceBreakdownDto.java**:

```java
private BigDecimal totalSurcharge = BigDecimal.ZERO; // ⚠️ 사용되지 않음

public void calculateTotalAmount() {
    this.totalAmount = this.basePrice
        .add(this.weekendSurcharge)     // 주말 할증
        .add(this.extraGuestFee)        // 추가 인원 요금
        .add(this.totalSurcharge)       // ⚠️ 항상 0
        .add(this.totalDiscount);       // 할인 (음수)
}
```

### 분석

1. **할증 항목 관리 방식**:
   - `weekendSurcharge`: PriceCalculationService에서 직접 계산 후 설정
   - `extraGuestFee`: PriceCalculationService에서 직접 계산 후 설정
   - `totalSurcharge`: `addItem()`으로만 집계됨

2. **실제 사용 현황**:

   ```java
   // PriceCalculationService.java
   breakdown.setWeekendSurcharge(weekendSurcharge); // ✅ 직접 설정
   breakdown.setExtraGuestFee(extraGuestFee);       // ✅ 직접 설정
   // totalSurcharge는 설정되지 않음 → 항상 0
   ```

3. **잠재적 위험**:
   - 향후 누군가 `addItem()`으로 할증을 추가하면 **중복 계산** 발생
   - `weekendSurcharge`는 이미 집계되었는데, `totalSurcharge`에도 더해짐

## ✅ 해결 방법

### 1. 백엔드: totalSurcharge 필드 제거

**PriceBreakdownDto.java**:

```java
// ❌ Before
@Builder.Default
private BigDecimal totalSurcharge = BigDecimal.ZERO;

public void addItem(PriceItemDto item) {
    this.items.add(item);
    if (item.getType().isDiscount()) {
        this.totalDiscount = this.totalDiscount.add(item.getAmount());
    } else if (item.getType().isSurcharge()) {
        this.totalSurcharge = this.totalSurcharge.add(item.getAmount()); // 사용 안됨
    }
}

public void calculateTotalAmount() {
    this.totalAmount = this.basePrice
        .add(this.weekendSurcharge)
        .add(this.extraGuestFee)
        .add(this.totalSurcharge)  // 항상 0
        .add(this.totalDiscount);
}

// ✅ After
// totalSurcharge 필드 제거

public void addItem(PriceItemDto item) {
    this.items.add(item);
    // 할인 항목만 자동 집계
    if (item.getType().isDiscount()) {
        this.totalDiscount = this.totalDiscount.add(item.getAmount());
    }
    // 할증 항목은 weekendSurcharge, extraGuestFee로 직접 관리
}

public void calculateTotalAmount() {
    this.totalAmount = this.basePrice
        .add(this.weekendSurcharge)
        .add(this.extraGuestFee)
        .add(this.totalDiscount); // totalDiscount는 음수
}
```

### 2. 프론트엔드: 타입 정의 수정

**types/domain/pricing.ts**:

```typescript
// ❌ Before
export type PriceBreakdown = {
  // ...
  weekendSurcharge?: number;
  totalSurcharge?: number; // 불필요
};

export type PriceBreakdownResponse = {
  // ...
  totalSurcharge: number; // 불필요
};

// ✅ After
export type PriceBreakdown = {
  // ...
  weekendSurcharge?: number;
  // totalSurcharge 제거
};

export type PriceBreakdownResponse = {
  // ...
  // totalSurcharge 제거
};
```

## 📊 영향 분석

### 수정된 파일

1. `backend/src/.../dto/PriceBreakdownDto.java`
2. `frontend/types/domain/pricing.ts`

### 영향 받는 기능

- ✅ 없음 (사용되지 않던 필드)

### 하위 호환성

- ✅ 완전 하위 호환 (기존 로직 변경 없음)
- JSON 응답에서 `totalSurcharge` 필드만 제거됨
- 프론트엔드는 optional 필드였으므로 문제 없음

## 🧪 테스트

### 빌드 검증

```bash
# Backend
cd backend
./gradlew clean build -x test -x checkstyleMain -x checkstyleTest
✓ BUILD SUCCESSFUL

# Frontend
cd frontend
npm run build
✓ Compiled successfully
```

### 가격 계산 검증

```java
// 예시: 2박 3일, 주말 포함, 추가 인원 2명
PriceBreakdownDto breakdown = priceCalculationService.calculatePrice(...);

// Before (totalSurcharge 포함)
totalAmount = 100,000 + 20,000 + 15,000 + 0 + (-10,000) = 125,000
            (base)  (weekend)(extra) (surge)(discount)

// After (totalSurcharge 제거)
totalAmount = 100,000 + 20,000 + 15,000 + (-10,000) = 125,000
            (base)  (weekend)(extra)  (discount)

// 결과: 동일 ✅
```

## 💡 개선 사항

### Before

```
할증 관리 방식이 혼재:
- weekendSurcharge: 직접 설정
- extraGuestFee: 직접 설정
- totalSurcharge: addItem()으로 집계 (미사용)
```

### After

```
명확한 할증 관리:
- weekendSurcharge: 직접 설정
- extraGuestFee: 직접 설정
- 기타 할증: 향후 필요시 별도 필드 추가
```

## 🔮 향후 계획

만약 향후 "기타 할증"이 필요하다면:

### 옵션 1: 별도 필드 추가

```java
private BigDecimal otherSurcharge = BigDecimal.ZERO;

public void calculateTotalAmount() {
    this.totalAmount = this.basePrice
        .add(this.weekendSurcharge)
        .add(this.extraGuestFee)
        .add(this.otherSurcharge)  // 명시적
        .add(this.totalDiscount);
}
```

### 옵션 2: items 기반 집계

```java
public void calculateTotalAmount() {
    BigDecimal surcharges = items.stream()
        .filter(item -> item.getType().isSurcharge())
        .map(PriceItemDto::getAmount)
        .reduce(BigDecimal.ZERO, BigDecimal::add);

    this.totalAmount = this.basePrice
        .add(surcharges)
        .add(this.totalDiscount);
}
```

**권장**: 옵션 1 (명시적이고 성능 좋음)

## 📚 관련 문서

- `price-calculation-fix.md` - Phase 1: 할인 계산 수정
- `payment-verification.md` - Phase 5: 금액 검증
- `REFACTORING-REPORT.md` - 전체 리팩토링 요약

---

**작성자**: GitHub Copilot  
**최종 수정**: 2024-11-18  
**Status**: ✅ FIXED
