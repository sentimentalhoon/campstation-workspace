# 요금제 시스템 구현 완료

**작업 일자**: 2025-11-02  
**작업자**: AI Assistant  
**목적**: 하드코딩된 요금(50,000원)을 다양한 요금제 시스템으로 개선

---

## 📋 목차

1. [개요](#개요)
2. [백엔드 구현](#백엔드-구현)
3. [프론트엔드 구현](#프론트엔드-구현)
4. [주요 기능](#주요-기능)
5. [API 명세](#api-명세)
6. [데이터베이스 스키마](#데이터베이스-스키마)
7. [사용 예시](#사용-예시)
8. [다음 단계](#다음-단계)

---

## 개요

### 문제점
- `ReservationService`에서 요금이 `BASE_PRICE_PER_NIGHT = 50000`으로 하드코딩됨
- 시즌별, 요일별, 인원별 차등 요금 불가능
- 할인 정책(장기 할인, 조기 예약 할인 등) 미구현

### 해결 방안
- 사이트별 다중 요금제 시스템 구축
- 우선순위 기반 요금제 적용 로직
- 복잡한 할인 정책 지원
- Owner용 요금제 관리 UI 제공

---

## 백엔드 구현

### 1. Enum 정의

#### SeasonType.java
계절별 시즌 구분
```java
public enum SeasonType {
    PEAK,    // 성수기 (7~8월)
    HIGH,    // 준성수기 (4~5, 9~10월)
    NORMAL,  // 일반
    LOW      // 비수기 (12~2월)
}
```

#### DiscountType.java
할인 정책 타입
```java
public enum DiscountType {
    LONG_STAY,      // 장기 할인
    EARLY_BIRD,     // 조기 예약 할인
    WEEKDAY,        // 평일 할인
    FIRST_BOOKING,  // 첫 예약 할인
    EXTENDED_STAY,  // 연박 할인
    GROUP           // 단체 할인
}
```

#### PricingRuleType.java
요금제 규칙 타입 및 기본 우선순위
```java
public enum PricingRuleType {
    BASE(0),           // 기본 요금제
    SEASONAL(10),      // 시즌별 요금제
    DATE_RANGE(20),    // 기간 지정 요금제
    SPECIAL_EVENT(30)  // 특별 이벤트 요금제
}
```

### 2. 엔티티 설계

#### SitePricing.java
사이트별 요금제 엔티티 (20+ 필드)

**기본 정보**
- `pricingName`: 요금제 이름
- `description`: 설명
- `ruleType`: 요금제 규칙 타입
- `priority`: 우선순위 (높을수록 먼저 적용)
- `isActive`: 활성화 여부

**요금 설정**
- `basePrice`: 기본 요금 (1박)
- `weekendPrice`: 주말 요금 (금토)
- `dayMultipliers`: 요일별 가격 배율 (JSON)

**인원 설정**
- `baseGuests`: 기준 인원
- `maxGuests`: 최대 인원
- `extraGuestFee`: 추가 인원 요금

**기간 설정**
- `seasonType`: 시즌 타입
- `startDate`: 시작 날짜
- `endDate`: 종료 날짜

**할인 정책**
- `longStayDiscountRate`: 장기 할인율
- `longStayMinNights`: 장기 할인 최소 숙박일
- `extendedStayDiscountRate`: 연박 할인율
- `extendedStayMinNights`: 연박 할인 최소 숙박일
- `earlyBirdDiscountRate`: 조기 예약 할인율
- `earlyBirdMinDays`: 조기 예약 최소 사전 예약일

**주요 메서드**
- `isApplicableOn(LocalDate)`: 특정 날짜에 적용 가능 여부 확인
- `matchesSeason(LocalDate)`: 시즌 매칭 확인
- `getDailyRate(DayOfWeek)`: 요일별 1박 요금 계산
- `calculateExtraGuestFee(Integer)`: 추가 인원 요금 계산
- `getLongStayDiscountRate(Integer)`: 장기/연박 할인율 반환
- `getEarlyBirdDiscountRate(Long)`: 조기 예약 할인율 반환

### 3. Repository

#### SitePricingRepository.java
```java
public interface SitePricingRepository extends JpaRepository<SitePricing, Long> {
    // 활성 요금제 조회 (우선순위 순)
    List<SitePricing> findBySiteIdAndIsActiveTrueOrderByPriorityDesc(Long siteId);
    
    // 모든 요금제 조회 (우선순위 순)
    List<SitePricing> findBySiteIdOrderByPriorityDesc(Long siteId);
    
    // 요금제 이름 중복 확인
    Optional<SitePricing> findBySiteIdAndPricingName(Long siteId, String pricingName);
    
    // 특정 날짜에 적용 가능한 요금제 조회
    @Query("SELECT sp FROM SitePricing sp WHERE sp.site.id = :siteId ...")
    List<SitePricing> findApplicablePricings(...);
    
    // 기간 겹침 확인
    List<SitePricing> findOverlappingPricings(...);
    
    // Owner의 모든 요금제 조회
    @Query("SELECT sp FROM SitePricing sp WHERE sp.site.campground.owner.id = :ownerId ...")
    List<SitePricing> findByOwnerId(Long ownerId);
}
```

### 4. DTO

#### CreateSitePricingRequest.java
요금제 생성/수정 요청 DTO (validation 포함)

#### SitePricingResponse.java
요금제 응답 DTO

#### PriceBreakdown.java
가격 계산 상세 내역 DTO
```java
public record PriceBreakdown(
    Long siteId,
    LocalDate checkInDate,
    LocalDate checkOutDate,
    Integer numberOfNights,
    Integer numberOfGuests,
    BigDecimal basePrice,
    BigDecimal extraGuestFee,
    BigDecimal subtotal,
    BigDecimal totalDiscount,
    BigDecimal totalAmount,
    List<DailyPriceDetail> dailyBreakdown,
    List<AppliedDiscount> appliedDiscounts
) {}
```

### 5. 핵심 서비스

#### PricingCalculationService.java (235+ 라인)
복잡한 요금 계산 로직의 핵심

**주요 메서드**
```java
public PriceBreakdown calculatePrice(
    Long siteId,
    LocalDate checkInDate,
    LocalDate checkOutDate,
    Integer numberOfGuests
) {
    // 1. 사이트의 활성 요금제 조회 (우선순위 순)
    List<SitePricing> pricings = pricingRepository
        .findBySiteIdAndIsActiveTrueOrderByPriorityDesc(siteId);
    
    // 2. 날짜별로 순회하며 적용 가능한 요금제 찾기
    // 3. 요일별 차등 요금 적용
    // 4. 추가 인원 요금 계산
    // 5. 장기 숙박 할인 적용
    // 6. 조기 예약 할인 적용
    // 7. 최종 금액 계산 및 상세 내역 반환
}
```

**계산 로직 흐름**
1. 날짜별 반복문으로 각 날짜에 적용 가능한 요금제 찾기
2. 우선순위가 높은 요금제부터 확인
3. 요일별 요금 적용 (주말/평일)
4. 기준 인원 초과 시 추가 인원 요금 계산
5. 숙박일 수에 따른 할인 적용
6. 예약 시점과 체크인 날짜 차이로 조기 예약 할인 적용
7. 상세 내역(DailyPriceDetail, AppliedDiscount) 포함하여 반환

#### SitePricingService.java
요금제 CRUD 비즈니스 로직
- `createSitePricing()`: 요금제 생성 (Owner 권한 확인)
- `getSitePricings()`: 사이트 요금제 목록 조회
- `updateSitePricing()`: 요금제 수정
- `deleteSitePricing()`: 요금제 삭제
- `getAllOwnerPricings()`: Owner의 모든 캠핑장 요금제 조회

### 6. REST API

#### SitePricingController.java
6개 API 엔드포인트 제공

**Owner 전용 API**
```java
POST   /api/v1/owner/sites/{siteId}/pricing           // 요금제 생성
GET    /api/v1/owner/sites/{siteId}/pricing           // 사이트 요금제 목록
PUT    /api/v1/owner/sites/{siteId}/pricing/{id}      // 요금제 수정
DELETE /api/v1/owner/sites/{siteId}/pricing/{id}      // 요금제 삭제
GET    /api/v1/owner/pricing                          // Owner 전체 요금제
```

**공개 API**
```java
GET    /api/v1/pricing/calculate                      // 요금 미리 계산
       ?siteId=1&checkInDate=2025-07-15&checkOutDate=2025-07-17&numberOfGuests=4
```

### 7. ReservationService 리팩토링

**변경 전**
```java
private static final BigDecimal BASE_PRICE_PER_NIGHT = BigDecimal.valueOf(50000);

private BigDecimal calculateTotalAmount(LocalDate checkInDate, LocalDate checkOutDate) {
    long numberOfNights = ChronoUnit.DAYS.between(checkInDate, checkOutDate);
    return BASE_PRICE_PER_NIGHT.multiply(BigDecimal.valueOf(numberOfNights));
}
```

**변경 후**
```java
private final PricingCalculationService pricingCalculationService;

private BigDecimal calculateTotalAmount(
    Site site,
    LocalDate checkInDate,
    LocalDate checkOutDate,
    Integer numberOfGuests
) {
    return pricingCalculationService.calculateTotalAmount(
        site.getId(), checkInDate, checkOutDate, numberOfGuests
    );
}
```

**수정된 3곳**
- `createReservation()`: 회원 예약 생성
- `updateReservation()`: 예약 수정
- `createGuestReservation()`: 비회원 예약 생성

### 8. 데이터베이스 마이그레이션

#### V9__add_site_pricing_table.sql

**테이블 생성**
```sql
CREATE TABLE site_pricing (
    id BIGSERIAL PRIMARY KEY,
    site_id BIGINT NOT NULL,
    pricing_name VARCHAR(100) NOT NULL,
    description TEXT,
    rule_type VARCHAR(20) NOT NULL,
    base_price DECIMAL(10, 2) NOT NULL,
    weekend_price DECIMAL(10, 2),
    day_multipliers JSONB,
    base_guests INTEGER NOT NULL DEFAULT 2,
    max_guests INTEGER NOT NULL DEFAULT 4,
    extra_guest_fee DECIMAL(10, 2),
    season_type VARCHAR(20),
    start_date DATE,
    end_date DATE,
    long_stay_discount_rate DECIMAL(5, 2),
    long_stay_min_nights INTEGER,
    extended_stay_discount_rate DECIMAL(5, 2),
    extended_stay_min_nights INTEGER,
    early_bird_discount_rate DECIMAL(5, 2),
    early_bird_min_days INTEGER,
    priority INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE
);
```

**인덱스 5개**
```sql
CREATE INDEX idx_site_pricing_site_id ON site_pricing(site_id);
CREATE INDEX idx_site_pricing_dates ON site_pricing(start_date, end_date);
CREATE INDEX idx_site_pricing_priority ON site_pricing(priority DESC);
CREATE INDEX idx_site_pricing_active ON site_pricing(is_active);
CREATE INDEX idx_site_pricing_rule_type ON site_pricing(rule_type);
```

**초기 데이터**
- 모든 사이트에 기본 요금제 자동 생성 (50,000원/평일, 70,000원/주말)
- 모든 사이트에 성수기 요금제 자동 생성 (80,000원/평일, 100,000원/주말, PEAK)

---

## 프론트엔드 구현

### 1. 타입 정의

#### types/index.ts
```typescript
// 시즌 타입
export type SeasonType = "PEAK" | "HIGH" | "NORMAL" | "LOW";

// 할인 타입
export type DiscountType =
  | "LONG_STAY"
  | "EARLY_BIRD"
  | "WEEKDAY"
  | "FIRST_BOOKING"
  | "EXTENDED_STAY"
  | "GROUP";

// 요금제 규칙 타입
export type PricingRuleType =
  | "BASE"
  | "SEASONAL"
  | "DATE_RANGE"
  | "SPECIAL_EVENT";

// 사이트 요금제
export interface SitePricing {
  id: number;
  siteId: number;
  pricingName: string;
  description?: string;
  ruleType: PricingRuleType;
  basePrice: number;
  weekendPrice?: number;
  dayMultipliers?: Record<string, number>;
  baseGuests: number;
  maxGuests: number;
  extraGuestFee?: number;
  seasonType?: SeasonType;
  startDate?: string;
  endDate?: string;
  longStayDiscountRate?: number;
  longStayMinNights?: number;
  extendedStayDiscountRate?: number;
  extendedStayMinNights?: number;
  earlyBirdDiscountRate?: number;
  earlyBirdMinDays?: number;
  priority: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// 가격 상세 내역
export interface PriceBreakdown {
  siteId: number;
  checkInDate: string;
  checkOutDate: string;
  numberOfNights: number;
  numberOfGuests: number;
  basePrice: number;
  extraGuestFee: number;
  subtotal: number;
  totalDiscount: number;
  totalAmount: number;
  dailyBreakdown: DailyPriceDetail[];
  appliedDiscounts: AppliedDiscount[];
}

export interface DailyPriceDetail {
  date: string;
  dailyRate: number;
  pricingName: string;
  isWeekend: boolean;
}

export interface AppliedDiscount {
  discountType: string;
  discountRate: number;
  discountAmount: number;
  description: string;
}
```

### 2. API 모듈

#### lib/api/pricing.ts
```typescript
export const pricingApi = {
  // 요금제 생성
  createPricing: async (siteId: number, data: CreateSitePricingRequest): Promise<SitePricing>
  
  // 요금제 목록 조회
  getSitePricings: async (siteId: number): Promise<SitePricing[]>
  
  // 요금제 수정
  updatePricing: async (siteId: number, pricingId: number, data: CreateSitePricingRequest): Promise<SitePricing>
  
  // 요금제 삭제
  deletePricing: async (siteId: number, pricingId: number): Promise<void>
  
  // Owner 전체 요금제 조회
  getAllOwnerPricings: async (): Promise<SitePricing[]>
  
  // 요금 미리 계산
  calculatePrice: async (
    siteId: number,
    checkInDate: string,
    checkOutDate: string,
    numberOfGuests: number
  ): Promise<PriceBreakdown>
}
```

### 3. 페이지 구조

#### 라우트
```
/campgrounds/[id]/sites/[siteId]/pricing
```

#### 컴포넌트 구조
```
pricing/
├── page.tsx                        # 라우트 페이지
├── PricingManagementClient.tsx    # 메인 클라이언트 컴포넌트
└── components/
    ├── PricingList.tsx             # 요금제 목록
    └── PricingModal.tsx            # 요금제 생성/수정 모달
```

### 4. 주요 컴포넌트

#### PricingManagementClient.tsx
**기능**
- Owner 권한 확인
- 요금제 목록 조회 및 상태 관리
- 요금제 CRUD 작업 처리
- 모달 상태 관리

**주요 함수**
```typescript
fetchPricings()         // 요금제 목록 조회
handleSavePricing()     // 요금제 생성/수정
handleDeletePricing()   // 요금제 삭제
handleEditPricing()     // 수정 모달 열기
handleAddPricing()      // 생성 모달 열기
```

#### PricingList.tsx
요금제 목록 카드 형식 표시

**표시 정보**
- 요금제 이름, 타입, 시즌
- 활성화 상태, 우선순위
- 기본 요금, 주말 요금
- 기준 인원/최대 인원, 추가 인원 요금
- 적용 기간
- 할인 정책 (장기/연박/조기예약)
- 수정/삭제 버튼

#### PricingModal.tsx
복잡한 요금제 생성/수정 폼 (10개 섹션)

**섹션 구성**
1. **기본 정보**: 이름, 타입, 설명
2. **가격 설정**: 기본 요금, 주말 요금
3. **인원 설정**: 기준/최대 인원, 추가 인원 요금
4. **적용 기간**: 시즌 타입, 시작/종료 날짜
5. **할인 설정**: 
   - 장기 할인 (할인율, 최소 숙박일)
   - 연박 할인 (할인율, 최소 숙박일)
   - 조기예약 할인 (할인율, 최소 사전 예약일)
6. **설정**: 우선순위, 활성화 여부

**폼 검증**
- 필수 필드: 이름, 타입, 기본 요금, 기준 인원, 최대 인원
- 숫자 검증: 요금(0+), 할인율(0-100%), 인원(1+)
- 날짜 검증: 시작일 <= 종료일

---

## 주요 기능

### 1. 다양한 요금제 타입

#### 기본 요금제 (BASE)
- 우선순위: 0 (가장 낮음)
- 항상 적용되는 기본 요금
- 다른 요금제가 없을 때 폴백으로 사용

#### 시즌별 요금제 (SEASONAL)
- 우선순위: 10
- 성수기/준성수기/일반/비수기 자동 매칭
- 예: 7~8월 성수기 요금 80,000원

#### 기간 지정 요금제 (DATE_RANGE)
- 우선순위: 20
- 특정 기간에만 적용
- 예: 2025-12-24 ~ 2025-12-26 크리스마스 특가

#### 특별 이벤트 요금제 (SPECIAL_EVENT)
- 우선순위: 30 (가장 높음)
- 특정 이벤트 기간 요금
- 예: 벚꽃 축제 기간, 불꽃놀이 이벤트

### 2. 유연한 가격 설정

#### 평일/주말 차등
```java
basePrice = 50,000원      // 월~목
weekendPrice = 70,000원   // 금~토
일요일 = basePrice
```

#### 요일별 배율
```json
{
  "FRIDAY": 1.2,      // 금요일 20% 할증
  "SATURDAY": 1.5,    // 토요일 50% 할증
  "SUNDAY": 0.9       // 일요일 10% 할인
}
```

#### 인원 정책
```
기준 인원: 2명
최대 인원: 4명
추가 인원 요금: 10,000원/1인

예) 3명 예약 시 = 기본 요금 + 10,000원
```

### 3. 할인 정책

#### 장기 할인 (Long Stay)
```
조건: 3박 이상
할인율: 10%
```

#### 연박 할인 (Extended Stay)
```
조건: 7박 이상
할인율: 20%
```

#### 조기 예약 할인 (Early Bird)
```
조건: 30일 전 예약
할인율: 15%
```

**할인 중복 적용**
- 모든 조건을 만족하면 모든 할인 적용
- 예: 7박 + 30일 전 예약 = 20% + 15% = 35% 할인

### 4. 우선순위 시스템

여러 요금제가 동시에 적용 가능한 경우:

```
1. SPECIAL_EVENT (30) - 가장 우선
2. DATE_RANGE (20)
3. SEASONAL (10)
4. BASE (0) - 폴백
```

**적용 예시**
- 2025-07-15 (토요일, 성수기)
- SEASONAL 요금제: 80,000원 (우선순위 10)
- SPECIAL_EVENT 요금제: 100,000원 (우선순위 30, 여름 특가 이벤트)
- **결과**: SPECIAL_EVENT 적용 → 100,000원

---

## API 명세

### 1. 요금제 생성

**Request**
```http
POST /api/v1/owner/sites/{siteId}/pricing
Authorization: Bearer {token}
Content-Type: application/json

{
  "pricingName": "여름 성수기 요금",
  "description": "7~8월 성수기 특별 요금",
  "ruleType": "SEASONAL",
  "basePrice": 80000,
  "weekendPrice": 100000,
  "baseGuests": 2,
  "maxGuests": 4,
  "extraGuestFee": 15000,
  "seasonType": "PEAK",
  "longStayDiscountRate": 10,
  "longStayMinNights": 3,
  "earlyBirdDiscountRate": 15,
  "earlyBirdMinDays": 30,
  "priority": 10,
  "isActive": true
}
```

**Response**
```json
{
  "success": true,
  "message": "요금제가 생성되었습니다",
  "data": {
    "id": 1,
    "siteId": 5,
    "pricingName": "여름 성수기 요금",
    "ruleType": "SEASONAL",
    "basePrice": 80000,
    "weekendPrice": 100000,
    "seasonType": "PEAK",
    "priority": 10,
    "isActive": true,
    "createdAt": "2025-11-02T10:00:00",
    "updatedAt": "2025-11-02T10:00:00"
  }
}
```

### 2. 요금 미리 계산

**Request**
```http
GET /api/v1/pricing/calculate?siteId=5&checkInDate=2025-07-15&checkOutDate=2025-07-17&numberOfGuests=3
```

**Response**
```json
{
  "success": true,
  "data": {
    "siteId": 5,
    "checkInDate": "2025-07-15",
    "checkOutDate": "2025-07-17",
    "numberOfNights": 2,
    "numberOfGuests": 3,
    "basePrice": 180000,
    "extraGuestFee": 15000,
    "subtotal": 195000,
    "totalDiscount": 29250,
    "totalAmount": 165750,
    "dailyBreakdown": [
      {
        "date": "2025-07-15",
        "dailyRate": 80000,
        "pricingName": "여름 성수기 요금",
        "isWeekend": false
      },
      {
        "date": "2025-07-16",
        "dailyRate": 100000,
        "pricingName": "여름 성수기 요금",
        "isWeekend": true
      }
    ],
    "appliedDiscounts": [
      {
        "discountType": "EARLY_BIRD",
        "discountRate": 15,
        "discountAmount": 29250,
        "description": "조기 예약 할인 (30일 전)"
      }
    ]
  }
}
```

---

## 사용 예시

### 시나리오 1: 기본 요금제 생성

**Owner 작업**
1. 사이트 관리 페이지 접속
2. "요금제 관리" 클릭
3. "요금제 추가" 클릭
4. 폼 작성:
   - 이름: "기본 요금"
   - 타입: BASE
   - 기본 요금: 50,000원
   - 주말 요금: 70,000원
   - 기준/최대 인원: 2/4명
   - 추가 인원: 10,000원
5. 저장

**결과**
- 평일: 50,000원/1박
- 주말: 70,000원/1박
- 3명 예약 시: +10,000원

### 시나리오 2: 성수기 요금제 + 할인

**Owner 작업**
1. "요금제 추가" 클릭
2. 폼 작성:
   - 이름: "여름 성수기"
   - 타입: SEASONAL
   - 시즌: PEAK (7~8월)
   - 기본 요금: 80,000원
   - 주말 요금: 100,000원
   - 장기 할인: 10% (3박+)
   - 조기 예약 할인: 15% (30일+)
   - 우선순위: 10
3. 저장

**고객 예약 케이스**

**케이스 1**: 2박 (7/15-7/17), 2명, 10일 전 예약
```
날짜별 요금:
- 7/15 (화): 80,000원
- 7/16 (수): 80,000원
소계: 160,000원
할인: 없음
총액: 160,000원
```

**케이스 2**: 4박 (7/15-7/19), 3명, 45일 전 예약
```
날짜별 요금:
- 7/15 (화): 80,000원
- 7/16 (수): 80,000원
- 7/17 (목): 80,000원
- 7/18 (금): 100,000원
기본 요금 소계: 340,000원
추가 인원 (1명): 15,000원
소계: 355,000원

할인:
- 장기 할인 (10%): -35,500원
- 조기 예약 할인 (15%): -53,250원
총 할인: -88,750원

최종 금액: 266,250원
```

### 시나리오 3: 특별 이벤트 요금

**Owner 작업**
1. "요금제 추가" 클릭
2. 폼 작성:
   - 이름: "크리스마스 특가"
   - 타입: SPECIAL_EVENT
   - 기간: 2025-12-24 ~ 2025-12-26
   - 기본 요금: 150,000원
   - 우선순위: 30
3. 저장

**결과**
- 12/24-12/26 기간에는 다른 모든 요금제보다 우선 적용
- 150,000원/1박 (이벤트 특가)

---

## 다음 단계

### 1. 예약 페이지 요금 미리보기 (진행 예정)
- [ ] 날짜 선택 시 실시간 요금 계산
- [ ] PriceBreakdown 상세 내역 표시
- [ ] dailyBreakdown (날짜별 요금) 테이블
- [ ] appliedDiscounts (적용된 할인) 목록
- [ ] 총액 강조 표시

### 2. Docker 및 마이그레이션
- [ ] `docker-compose down && docker-compose up -d --build`
- [ ] Flyway V9 마이그레이션 자동 실행 확인
- [ ] site_pricing 테이블 생성 확인
- [ ] 기존 사이트에 기본 요금제 자동 생성 확인

### 3. 테스트
- [ ] 기본 요금제로 예약 생성 테스트
- [ ] 성수기 날짜 선택 시 요금 확인
- [ ] 3박 이상 장기 할인 적용 확인
- [ ] 30일 전 조기 예약 할인 확인
- [ ] 추가 인원 요금 계산 확인
- [ ] Owner 요금제 생성/수정/삭제 테스트

### 4. 추가 기능 (향후)
- [ ] 요금제 템플릿 제공 (빠른 설정)
- [ ] 요금제 복사 기능
- [ ] 요금제 적용 미리보기 (캘린더 뷰)
- [ ] 요금제 통계 (가장 많이 사용된 요금제)
- [ ] 요금제 이력 관리
- [ ] 대량 요금제 등록 (CSV 업로드)

---

## 기술 스택

### 백엔드
- **언어**: Java 21
- **프레임워크**: Spring Boot 3.x
- **ORM**: JPA (Hibernate)
- **데이터베이스**: PostgreSQL 15
- **마이그레이션**: Flyway
- **빌드 도구**: Gradle

### 프론트엔드
- **언어**: TypeScript
- **프레임워크**: Next.js 15.5.4
- **UI 라이브러리**: React 18
- **스타일**: Tailwind CSS
- **빌드 도구**: Turbopack

---

## 파일 구조

### 백엔드
```
backend/src/main/java/com/campstation/camp/pricing/
├── domain/
│   ├── SeasonType.java
│   ├── DiscountType.java
│   ├── PricingRuleType.java
│   └── SitePricing.java
├── repository/
│   └── SitePricingRepository.java
├── dto/
│   ├── CreateSitePricingRequest.java
│   ├── SitePricingResponse.java
│   └── PriceBreakdown.java
├── service/
│   ├── PricingCalculationService.java
│   └── SitePricingService.java
└── controller/
    └── SitePricingController.java

backend/src/main/resources/db/migration/
└── V9__add_site_pricing_table.sql
```

### 프론트엔드
```
frontend/src/
├── types/
│   └── index.ts (SitePricing, PriceBreakdown 등 추가)
├── lib/api/
│   └── pricing.ts
└── app/campgrounds/[id]/sites/[siteId]/pricing/
    ├── page.tsx
    ├── PricingManagementClient.tsx
    └── components/
        ├── PricingList.tsx
        └── PricingModal.tsx
```

---

## 빌드 결과

### 백엔드
```
BUILD SUCCESSFUL in 5s
5 actionable tasks: 4 executed, 1 up-to-date
```

### 프론트엔드
```
✓ Compiled successfully in 3.6s
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages (17/17)

Route: /campgrounds/[id]/sites/[siteId]/pricing
Size: 5.74 kB
First Load JS: 155 kB
```

---

## 마무리

이번 작업으로 CampStation 프로젝트에 완전히 유연한 요금제 시스템이 구축되었습니다.

**주요 성과**
✅ 하드코딩된 요금 제거  
✅ 다양한 요금제 타입 지원 (4가지)  
✅ 복잡한 할인 정책 구현 (3가지)  
✅ 우선순위 기반 요금 적용 로직  
✅ Owner용 관리 UI 완성  
✅ 상세한 가격 내역 제공  

**비즈니스 임팩트**
- Owner가 시즌별, 이벤트별로 자유롭게 요금 설정 가능
- 다양한 할인 정책으로 고객 유치 전략 수립 가능
- 투명한 가격 정보로 고객 신뢰 향상
- 자동화된 요금 계산으로 예약 프로세스 개선

---

## 버그 수정 및 개선 사항

### 1. 사이트 관리 페이지에 요금제 관리 버튼 추가 (2025-11-02)

**문제:**
- 요금제 관리 페이지는 만들어졌지만 접근 경로가 없어 직접 URL을 입력해야 함
- 사용자 편의성 저하

**해결:**
- `SiteSection.tsx` 컴포넌트 수정
- 각 사이트 카드에 "요금제 관리" 버튼 추가
- 버튼 위치: 수정/삭제 버튼 아래에 전체 너비로 배치
- 버튼 스타일: 녹색 (success) 테마, 통화 아이콘 포함
- 링크: `/campgrounds/[campgroundId]/sites/[siteId]/pricing`

**변경 파일:**
```
frontend/src/components/campground-edit/SiteSection.tsx
frontend/.prettierrc (중복 설정 제거)
```

**커밋:**
```
feat: 사이트 관리 페이지에 요금제 관리 버튼 추가
- SiteSection 컴포넌트에 요금제 관리 링크 추가
- 각 사이트 카드에서 직접 요금제 관리 페이지로 이동 가능
```

---

### 2. SitePricingController Authentication 처리 버그 수정 (2025-11-02)

**문제:**
- API 호출 시 400 Bad Request 에러 발생
- 에러 메시지: `"For input string: \"com.campstation.camp.user.domain.User@5e967115\""`
- 원인: `authentication.getPrincipal().toString()`를 `Long.parseLong()`으로 파싱 시도
- `Principal`이 User 객체를 반환하는데, 이를 문자열로 변환하면 객체의 toString() 결과가 나옴

**해결:**
1. `UserService` 의존성 주입 추가
2. `authentication.getName()`으로 사용자 email 추출
3. `userService.findByEmail(email)`로 User 객체 조회
4. `user.getId()`로 Long 타입의 ownerId 추출

**수정 전 코드:**
```java
String email = authentication.getName();
Long ownerId = Long.parseLong(authentication.getPrincipal().toString()); // ❌ 에러 발생
```

**수정 후 코드:**
```java
String email = authentication.getName();
User user = userService.findByEmail(email)
        .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
Long ownerId = user.getId(); // ✅ 정상 작동
```

**적용된 메서드 (5개):**
- `createSitePricing()` - POST /api/v1/owner/sites/{siteId}/pricing
- `getSitePricings()` - GET /api/v1/owner/sites/{siteId}/pricing
- `updateSitePricing()` - PUT /api/v1/owner/sites/{siteId}/pricing/{pricingId}
- `deleteSitePricing()` - DELETE /api/v1/owner/sites/{siteId}/pricing/{pricingId}
- `getAllOwnerPricings()` - GET /api/v1/owner/pricing

**변경 파일:**
```java
backend/src/main/java/com/campstation/camp/pricing/controller/SitePricingController.java
```

**추가 import:**
```java
import com.campstation.camp.user.domain.User;
import com.campstation.camp.user.service.UserService;
```

**커밋:**
```
fix: SitePricingController Authentication Principal 처리 수정
- authentication.getPrincipal().toString()를 Long.parseLong() 시도 시 발생하는 에러 수정
- UserService 주입받아 email로 User 조회 후 ID 추출하도록 변경
- 모든 Owner 전용 API 엔드포인트에 적용
```

**테스트 결과:**
- ✅ 요금제 목록 조회 성공
- ✅ 요금제 생성 가능
- ✅ 요금제 수정 가능
- ✅ 요금제 삭제 가능

---

**작성일**: 2025-11-02  
**최종 수정일**: 2025-11-02  
**버전**: 1.1  
**상태**: ✅ 완료 및 버그 수정
