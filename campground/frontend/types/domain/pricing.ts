/**
 * 가격 계산 관련 도메인 타입
 */

/**
 * 가격 항목 타입
 */
export type PriceItemType =
  | "BASE_PRICE" // 기본 요금
  | "WEEKEND_SURCHARGE" // 주말 할증
  | "DAY_SURCHARGE" // 요일 할증
  | "EXTRA_GUEST_FEE" // 추가 인원 요금
  | "LONG_STAY_DISCOUNT" // 장기 숙박 할인
  | "EXTENDED_STAY_DISCOUNT" // 연박 할인
  | "EARLY_BIRD_DISCOUNT" // 얼리버드 할인
  | "SEASONAL_DISCOUNT" // 시즌 할인
  | "COUPON_DISCOUNT" // 쿠폰 할인
  | "POINT_DISCOUNT" // 포인트 할인
  | "OTHER_DISCOUNT" // 기타 할인
  | "OTHER_SURCHARGE"; // 기타 추가 요금

/**
 * 가격 항목
 */
export type PriceItem = {
  type: PriceItemType;
  name: string; // 화면에 표시될 이름 (예: "기본 요금 (2박)")
  quantity: number; // 수량 (박수, 인원 등)
  unitPrice: number; // 단가
  amount: number; // 총액 (할인은 음수)
  displayOrder: number; // 표시 순서
  appliedPricingId?: number; // 적용된 요금제 ID
};

/**
 * 일별 가격 상세 (백엔드 응답)
 */
export type DailyBreakdown = {
  date: string; // 날짜 (YYYY-MM-DD)
  dailyRate: number; // 일별 적용 요금
  pricingName: string; // 적용된 요금제 이름
  weekend: boolean; // 주말 여부
};

/**
 * 적용된 할인 정보
 */
export type AppliedDiscount = {
  discountType: string; // 할인 타입 (예: LONG_STAY)
  discountRate: number; // 할인율 (%)
  discountAmount: number; // 할인 금액
  description: string; // 할인 설명
};

/**
 * 가격 상세 내역 (백엔드 응답)
 */
export type PriceBreakdown = {
  siteId: number; // 사이트 ID
  checkInDate: string; // 체크인 날짜
  checkOutDate: string; // 체크아웃 날짜
  numberOfNights: number; // 숙박 일수
  numberOfGuests: number; // 투숙객 수
  basePrice: number; // 기본 요금 총액
  subtotal: number; // 소계 (할인 전)
  extraGuestFee: number; // 추가 인원 요금 총액
  totalDiscount: number; // 총 할인 금액
  totalSurcharge?: number; // 총 할증 금액
  totalAmount: number; // 최종 결제 금액
  dailyBreakdown: DailyBreakdown[]; // 일별 가격 상세
  appliedDiscounts: AppliedDiscount[]; // 적용된 할인 목록

  // 레거시 필드 (선택적, 하위 호환성)
  items?: PriceItem[]; // 상세 항목 목록
  weekendSurcharge?: number; // 주말 할증 총액
};

/**
 * 가격 계산 요청 (쿼리 파라미터로 전송)
 */
export type CalculatePriceRequest = {
  siteId: number;
  checkInDate: string; // ISO 날짜 (YYYY-MM-DD)
  checkOutDate: string; // ISO 날짜 (YYYY-MM-DD)
  numberOfGuests: number;
};

/**
 * 가격 계산 응답 (백엔드 PriceBreakdownDto와 매핑)
 */
export type CalculatePriceResponse = PriceBreakdown;

/**
 * 가격 계산 응답 (원본 - 백엔드 호환)
 * @deprecated Use PriceBreakdown instead
 */
export type PriceBreakdownResponse = {
  basePrice: number;
  weekendSurcharge: number;
  extraGuestFee: number;
  totalDiscount: number;
  totalSurcharge: number;
  totalAmount: number;
  items: PriceItem[];
};

/**
 * 가격 항목 타입별 라벨
 */
export const PRICE_ITEM_TYPE_LABELS: Record<PriceItemType, string> = {
  BASE_PRICE: "기본 요금",
  WEEKEND_SURCHARGE: "주말 할증",
  DAY_SURCHARGE: "요일 할증",
  EXTRA_GUEST_FEE: "추가 인원 요금",
  LONG_STAY_DISCOUNT: "장기 숙박 할인",
  EXTENDED_STAY_DISCOUNT: "연박 할인",
  EARLY_BIRD_DISCOUNT: "얼리버드 할인",
  SEASONAL_DISCOUNT: "시즌 할인",
  COUPON_DISCOUNT: "쿠폰 할인",
  POINT_DISCOUNT: "포인트 할인",
  OTHER_DISCOUNT: "기타 할인",
  OTHER_SURCHARGE: "기타 추가 요금",
};

/**
 * 할인 항목인지 확인
 */
export function isDiscountItem(type: PriceItemType): boolean {
  return (
    type === "LONG_STAY_DISCOUNT" ||
    type === "EXTENDED_STAY_DISCOUNT" ||
    type === "EARLY_BIRD_DISCOUNT" ||
    type === "SEASONAL_DISCOUNT" ||
    type === "COUPON_DISCOUNT" ||
    type === "POINT_DISCOUNT" ||
    type === "OTHER_DISCOUNT"
  );
}

/**
 * 할증 항목인지 확인
 */
export function isSurchargeItem(type: PriceItemType): boolean {
  return (
    type === "WEEKEND_SURCHARGE" ||
    type === "DAY_SURCHARGE" ||
    type === "OTHER_SURCHARGE"
  );
}

/**
 * 금액 포맷팅 (한국 원화)
 */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
  }).format(amount);
}

/**
 * 금액 포맷팅 (숫자만, 콤마 포함)
 */
export function formatPriceNumber(amount: number): string {
  return new Intl.NumberFormat("ko-KR").format(amount);
}
