package com.campstation.camp.pricing.domain;

/**
 * 가격 항목 타입
 * 예약 금액 계산 시 각 항목의 유형을 구분
 *
 * @author CampStation Team
 * @version 1.0
 * @since 2025-01-01
 */
public enum PriceItemType {
    /**
     * 기본 요금 (1박 기준)
     */
    BASE_PRICE("기본 요금"),

    /**
     * 주말 할증 (금요일/토요일)
     */
    WEEKEND_SURCHARGE("주말 할증"),

    /**
     * 요일별 할증 (특정 요일)
     */
    DAY_SURCHARGE("요일 할증"),

    /**
     * 추가 인원 요금
     */
    EXTRA_GUEST_FEE("추가 인원 요금"),

    /**
     * 장기 숙박 할인 (3박 이상)
     */
    LONG_STAY_DISCOUNT("장기 숙박 할인"),

    /**
     * 연박 할인 (5박 이상)
     */
    EXTENDED_STAY_DISCOUNT("연박 할인"),

    /**
     * 조기 예약 할인
     */
    EARLY_BIRD_DISCOUNT("얼리버드 할인"),

    /**
     * 시즌별 할인
     */
    SEASONAL_DISCOUNT("시즌 할인"),

    /**
     * 쿠폰 할인 (향후 확장)
     */
    COUPON_DISCOUNT("쿠폰 할인"),

    /**
     * 포인트 할인 (향후 확장)
     */
    POINT_DISCOUNT("포인트 할인"),

    /**
     * 기타 할인
     */
    OTHER_DISCOUNT("기타 할인"),

    /**
     * 기타 추가 요금
     */
    OTHER_SURCHARGE("기타 추가 요금");

    private final String description;

    PriceItemType(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }

    /**
     * 할인 항목인지 확인
     *
     * @return 할인 항목이면 true
     */
    public boolean isDiscount() {
        return this == LONG_STAY_DISCOUNT
            || this == EXTENDED_STAY_DISCOUNT
            || this == EARLY_BIRD_DISCOUNT
            || this == SEASONAL_DISCOUNT
            || this == COUPON_DISCOUNT
            || this == POINT_DISCOUNT
            || this == OTHER_DISCOUNT;
    }

    /**
     * 할증 항목인지 확인
     *
     * @return 할증 항목이면 true
     */
    public boolean isSurcharge() {
        return this == WEEKEND_SURCHARGE
            || this == DAY_SURCHARGE
            || this == OTHER_SURCHARGE;
    }
}
