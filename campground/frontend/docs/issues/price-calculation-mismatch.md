# 🐛 예약 생성 시 가격 불일치 문제

## 문제 요약

예약 생성 시 프론트엔드에서 계산한 가격과 백엔드 DB에 저장되는 가격이 일치하지 않습니다.

### 실제 사례
- **프론트엔드 계산**: 180,500원 (할인 적용됨)
- **백엔드 DB 저장**: 260,500원 (할인 미적용 또는 다른 로직)
- **차이**: 80,000원

---

## 근본 원인

백엔드에 **두 개의 서로 다른 가격 계산 로직**이 존재합니다:

### 1️⃣ 실시간 가격 계산 API (정상)
```http
GET /v1/pricing/calculate?siteId=123&checkInDate=2025-12-01&checkOutDate=2025-12-03&numberOfGuests=2
```

**응답 예시:**
```json
{
  "siteId": 123,
  "checkInDate": "2025-12-01",
  "checkOutDate": "2025-12-03",
  "numberOfNights": 2,
  "numberOfGuests": 2,
  "basePrice": 200000,
  "subtotal": 260500,
  "totalDiscount": 80000,
  "totalAmount": 180500,
  "dailyBreakdown": [
    {
      "date": "2025-12-01",
      "dailyRate": 130000,
      "pricingName": "주말 요금",
      "weekend": true
    },
    {
      "date": "2025-12-02",
      "dailyRate": 130500,
      "pricingName": "주말 요금",
      "weekend": true
    }
  ],
  "appliedDiscounts": [
    {
      "discountType": "LONG_STAY",
      "discountRate": 30,
      "discountAmount": 80000,
      "description": "장기 숙박 할인"
    }
  ]
}
```

### 2️⃣ 예약 생성 API (문제)
```http
POST /v1/reservations
```

**요청 Body:**
```json
{
  "campgroundId": 1,
  "siteId": 123,
  "checkInDate": "2025-12-01",
  "checkOutDate": "2025-12-03",
  "numberOfGuests": 2,
  "paymentMethod": "CARD"
}
```

**문제점:**
- Request Body에 `priceBreakdown` 또는 `totalAmount` 필드 없음
- 백엔드가 내부에서 가격을 **재계산**하고 있음
- 이 재계산 로직이 실시간 계산 API와 **다름**
- 결과적으로 DB에 **잘못된 totalAmount** 저장

**응답 예시 (문제 상황):**
```json
{
  "id": 88,
  "totalAmount": 260500,  // ❌ 할인이 적용되지 않음
  "priceBreakdown": {
    "items": [
      {
        "type": "BASE_PRICE",
        "name": "기본 요금 (2박)",
        "amount": 260500
      }
    ],
    "totalAmount": 260500,
    "totalDiscount": 0  // ❌ 할인 미적용
  }
}
```

---

## 문제 영향

1. **고객 신뢰도 하락**: 예약 페이지에서 본 가격과 실제 결제 금액이 다름
2. **매출 손실**: 할인이 적용되지 않아 고객이 더 비싼 가격을 보게 됨
3. **데이터 불일치**: DB에 저장된 가격 정보가 정확하지 않음
4. **결제 실패 위험**: 결제 금액 검증 시 불일치로 인한 오류 가능성

---

## 재현 방법

### 1. 프론트엔드 콘솔 로그 확인

예약 생성 시 다음 로그 확인:

```
🔍 [DEBUG] 예약 생성 요청 상세: {
  reservationData: { ... },
  프론트계산값: {
    totalPrice: 180500,
    priceBreakdown: { totalAmount: 180500 },
    basePrice: 100000,
    nights: 2,
    adults: 2,
    children: 0,
    numberOfGuests: 2
  }
}

🔍 [DEBUG] 예약 생성 응답 상세: {
  백엔드totalAmount: 260500,  // ❌ 다름
  프론트totalPrice: 180500,
  차이: 80000,
  reservation: { ... }
}
```

### 2. 백엔드 로그 확인

다음을 확인해야 합니다:
- 예약 생성 시 어떤 가격 계산 로직을 사용하는가?
- 실시간 계산 API와 동일한 `PricingService`를 사용하는가?
- 할인 정책이 제대로 적용되는가?

---

## 해결 방안

### ✅ 옵션 1: 동일한 가격 계산 서비스 사용 (권장)

예약 생성 시에도 실시간 계산 API와 **동일한 PricingService**를 사용하도록 수정:

```java
// ReservationService.java
@Service
public class ReservationService {

    @Autowired
    private PricingService pricingService;  // ✅ 동일한 서비스 사용

    public Reservation createReservation(CreateReservationDto dto) {
        // ✅ 동일한 계산 로직 사용
        PriceBreakdown priceBreakdown = pricingService.calculatePrice(
            dto.getSiteId(),
            dto.getCheckInDate(),
            dto.getCheckOutDate(),
            dto.getNumberOfGuests()
        );

        Reservation reservation = new Reservation();
        reservation.setTotalAmount(priceBreakdown.getTotalAmount());
        reservation.setPriceBreakdown(priceBreakdown);
        // ... 나머지 필드 설정

        return reservationRepository.save(reservation);
    }
}
```

### ✅ 옵션 2: Request Body에 priceBreakdown 추가

프론트엔드에서 계산한 가격을 백엔드로 전달:

**백엔드 DTO 수정:**
```java
// CreateReservationDto.java
public class CreateReservationDto {
    private Long campgroundId;
    private Long siteId;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private Integer numberOfGuests;
    private PaymentMethod paymentMethod;
    private String depositorName;

    @Valid
    private PriceBreakdown priceBreakdown;  // ✅ 추가
}
```

**백엔드 서비스 수정:**
```java
// ReservationService.java
public Reservation createReservation(CreateReservationDto dto) {
    PriceBreakdown priceBreakdown = dto.getPriceBreakdown();

    // ✅ 검증: 프론트엔드 계산값이 정확한지 확인 (보안)
    PriceBreakdown verified = pricingService.calculatePrice(
        dto.getSiteId(),
        dto.getCheckInDate(),
        dto.getCheckOutDate(),
        dto.getNumberOfGuests()
    );

    if (!verified.getTotalAmount().equals(priceBreakdown.getTotalAmount())) {
        throw new InvalidPriceException("가격 정보가 일치하지 않습니다.");
    }

    // ✅ 검증된 priceBreakdown 사용
    Reservation reservation = new Reservation();
    reservation.setTotalAmount(priceBreakdown.getTotalAmount());
    reservation.setPriceBreakdown(priceBreakdown);
    // ...
}
```

**프론트엔드 수정:**
```typescript
// useReservationFlow.ts
const reservationData: CreateReservationRequest = {
  campgroundId,
  siteId: selectedSiteId!,
  checkInDate,
  checkOutDate,
  numberOfGuests: adults + children,
  paymentMethod,
  priceBreakdown: priceBreakdown,  // ✅ 추가
};
```

---

## 추천 방안

**옵션 1 (동일한 PricingService 사용)을 권장합니다:**

### 이유:
1. **단일 책임 원칙**: 가격 계산 로직이 한 곳에만 존재
2. **유지보수 용이**: 가격 정책 변경 시 한 곳만 수정
3. **버그 방지**: 두 API의 계산 로직 불일치 문제 원천 차단
4. **프론트엔드 독립성**: 프론트엔드가 가격을 전송할 필요 없음
5. **보안**: 클라이언트가 가격을 조작할 수 없음

### 옵션 2의 단점:
- 프론트엔드가 정확한 가격을 전송해야 함 (신뢰 문제)
- 백엔드에서 검증 로직 필요 (결국 같은 계산을 두 번 수행)
- API 스펙 변경 필요 (하위 호환성)

---

## 테스트 계획

### 1. 단위 테스트
```java
@Test
public void testReservationCreation_PriceCalculation() {
    // Given
    CreateReservationDto dto = new CreateReservationDto();
    dto.setSiteId(123L);
    dto.setCheckInDate(LocalDate.of(2025, 12, 1));
    dto.setCheckOutDate(LocalDate.of(2025, 12, 3));
    dto.setNumberOfGuests(2);

    // When
    Reservation reservation = reservationService.createReservation(dto);
    PriceBreakdown realTimeCalc = pricingService.calculatePrice(
        123L,
        LocalDate.of(2025, 12, 1),
        LocalDate.of(2025, 12, 3),
        2
    );

    // Then
    assertEquals(realTimeCalc.getTotalAmount(), reservation.getTotalAmount());
    assertEquals(realTimeCalc.getTotalDiscount(), reservation.getPriceBreakdown().getTotalDiscount());
}
```

### 2. 통합 테스트
```java
@Test
public void testReservationFlow_EndToEnd() {
    // 1. 실시간 가격 계산 API 호출
    ResponseEntity<PriceBreakdown> calcResponse = restTemplate.getForEntity(
        "/v1/pricing/calculate?siteId=123&checkInDate=2025-12-01&checkOutDate=2025-12-03&numberOfGuests=2",
        PriceBreakdown.class
    );

    // 2. 예약 생성 API 호출
    CreateReservationDto dto = new CreateReservationDto();
    // ... dto 설정
    ResponseEntity<Reservation> reservationResponse = restTemplate.postForEntity(
        "/v1/reservations",
        dto,
        Reservation.class
    );

    // 3. 가격 일치 검증
    assertEquals(calcResponse.getBody().getTotalAmount(),
                 reservationResponse.getBody().getTotalAmount());
}
```

---

## 우선순위

- **심각도**: 🔴 **Critical** (고객 결제 금액에 직접 영향)
- **긴급도**: 🔴 **High** (매 예약마다 발생)
- **권장 처리 기한**: **즉시** (다음 배포 전 필수 수정)

---

## 관련 파일

### 프론트엔드
- `app/reservations/new/hooks/useReservationFlow.ts` (예약 생성 로직)
- `hooks/usePriceCalculation.ts` (실시간 가격 계산)
- `lib/api/pricing.ts` (가격 계산 API 클라이언트)
- `lib/api/reservations.ts` (예약 생성 API 클라이언트)
- `types/domain/reservation.ts` (CreateReservationDto 타입)

### 백엔드 (추정)
- `ReservationService.java` (예약 생성 로직)
- `PricingService.java` (가격 계산 로직)
- `CreateReservationDto.java` (예약 생성 DTO)
- `Reservation.java` (예약 엔티티)

---

## 추가 참고사항

### 현재 디버그 로그 위치
`app/reservations/new/hooks/useReservationFlow.ts:243-263`에 상세한 디버그 로그가 추가되어 있어, 실제 차이를 콘솔에서 확인할 수 있습니다.

### API 엔드포인트
- 실시간 계산: `GET /v1/pricing/calculate`
- 예약 생성: `POST /v1/reservations`

---

**작성일**: 2025-11-18
**작성자**: 프론트엔드 팀
**상태**: 🔴 Open (백엔드 수정 대기 중)
