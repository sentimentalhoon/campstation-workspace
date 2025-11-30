/**
 * 사이트 요금제 관련 타입 정의
 *
 * @module types/pricing
 * @description 캠핑장 사이트별 요금제 시스템 타입
 */

/**
 * 요금 규칙 타입
 */
export type PricingRuleType =
  | "BASE" // 기본 요금제 (연중 적용)
  | "SEASONAL" // 시즌별 요금제 (성수기/비수기)
  | "DATE_RANGE" // 기간 지정 요금제 (특정 날짜)
  | "SPECIAL_EVENT"; // 특별 이벤트 요금제

/**
 * 시즌 타입
 */
export type SeasonType =
  | "PEAK" // 성수기 (여름 휴가철)
  | "HIGH" // 준성수기 (봄/가을)
  | "NORMAL" // 평시
  | "LOW"; // 비수기 (겨울)

/**
 * 요일별 배율 맵
 * JSON 문자열로 저장되므로 파싱 후 사용
 */
export type DayMultipliers = {
  MONDAY?: number;
  TUESDAY?: number;
  WEDNESDAY?: number;
  THURSDAY?: number;
  FRIDAY?: number;
  SATURDAY?: number;
  SUNDAY?: number;
};

/**
 * 요금제 생성 요청
 */
export type CreateSitePricingRequest = {
  // 기본 정보
  pricingName: string;
  description?: string;
  ruleType: PricingRuleType;

  // 기본 요금
  basePrice: number;
  weekendPrice?: number;
  dayMultipliers?: string; // JSON 문자열

  // 인원 정책
  baseGuests: number; // 기준 인원 (기본 2)
  maxGuests: number; // 최대 인원 (기본 4)
  extraGuestFee?: number; // 추가 인원당 요금

  // 시즌/기간
  seasonType?: SeasonType;
  startMonth?: number; // 1-12
  startDay?: number; // 1-31
  endMonth?: number; // 1-12
  endDay?: number; // 1-31

  // 할인 정책
  longStayDiscountRate?: number; // 장기 숙박 할인율 (%)
  longStayMinNights?: number; // 최소 박수
  extendedStayDiscountRate?: number; // 연박 할인율 (%)
  extendedStayMinNights?: number; // 최소 박수
  earlyBirdDiscountRate?: number; // 조기 예약 할인율 (%)
  earlyBirdMinDays?: number; // 최소 일수

  // 우선순위 및 상태
  priority: number; // 숫자가 높을수록 우선
  isActive: boolean; // 활성화 여부
};

/**
 * 요금제 수정 요청 (생성과 동일한 구조)
 */
export type UpdateSitePricingRequest = CreateSitePricingRequest;

/**
 * 요금제 응답
 */
export type SitePricingResponse = {
  id: number;
  siteId: number;
  siteName: string;
  pricingName: string;
  description?: string;
  ruleType: PricingRuleType;

  // 기본 요금
  basePrice: number;
  weekendPrice?: number;
  dayMultipliers?: string;

  // 인원 정책
  baseGuests: number;
  maxGuests: number;
  extraGuestFee?: number;

  // 시즌/기간
  seasonType?: SeasonType;
  startMonth?: number;
  startDay?: number;
  endMonth?: number;
  endDay?: number;

  // 할인 정책
  longStayDiscountRate?: number;
  longStayMinNights?: number;
  extendedStayDiscountRate?: number;
  extendedStayMinNights?: number;
  earlyBirdDiscountRate?: number;
  earlyBirdMinDays?: number;

  // 우선순위 및 상태
  priority: number;
  isActive: boolean;

  createdAt: string;
  updatedAt: string;
};

/**
 * 일별 요금 상세
 */
export type DailyPriceDetail = {
  date: string; // YYYY-MM-DD
  basePrice: number; // 기본 요금
  appliedPrice: number; // 적용된 요금 (배율 적용 후)
  pricingName: string; // 적용된 요금제 이름
};

/**
 * 적용된 할인 정보
 */
export type AppliedDiscount = {
  type: string; // LONG_STAY, EXTENDED_STAY, EARLY_BIRD
  name: string; // 할인명 (예: "장기 숙박 할인")
  amount: number; // 할인 금액 (음수)
  rate?: number; // 할인율 (%)
};

/**
 * 요금 상세 내역
 */
export type PriceBreakdown = {
  siteId: number;
  checkInDate: string; // YYYY-MM-DD
  checkOutDate: string; // YYYY-MM-DD
  numberOfNights: number; // 총 숙박일수
  numberOfGuests: number; // 인원 수

  // 일별 요금
  dailyPrices: DailyPriceDetail[];

  // 요금 계산
  subtotal: number; // 소계 (일별 요금 합계)
  extraGuestFee: number; // 추가 인원 요금
  discounts: AppliedDiscount[]; // 적용된 할인 목록
  totalDiscount: number; // 총 할인 금액
  finalPrice: number; // 최종 결제 금액
};

/**
 * 요금 계산 요청 파라미터
 */
export type CalculatePriceParams = {
  siteId: number;
  checkInDate: string; // YYYY-MM-DD
  checkOutDate: string; // YYYY-MM-DD
  numberOfGuests: number;
};

/**
 * 요금제 목록 필터 (향후 확장용)
 */
export type SitePricingFilter = {
  isActive?: boolean; // 활성화된 요금제만
  ruleType?: PricingRuleType;
  seasonType?: SeasonType;
};
