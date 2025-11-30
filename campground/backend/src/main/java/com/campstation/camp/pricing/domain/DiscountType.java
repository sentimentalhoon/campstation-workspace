package com.campstation.camp.pricing.domain;

/**
 * 할인 타입
 * 다양한 할인 정책을 위한 enum
 * 
 * @author CampStation Team
 * @version 1.0
 * @since 2025-01-01
 */
public enum DiscountType {
    /**
     * 장기 숙박 할인
     * 3박 이상 시 할인 적용
     */
    LONG_STAY("장기 숙박 할인", "3박 이상 예약 시 할인"),
    
    /**
     * 조기 예약 할인
     * 체크인 30일 이전 예약 시 할인
     */
    EARLY_BIRD("조기 예약 할인", "30일 전 예약 시 할인"),
    
    /**
     * 주중 할인
     * 일~목요일 예약 시 할인
     */
    WEEKDAY("주중 할인", "일~목요일 할인"),
    
    /**
     * 첫 예약 할인
     * 신규 회원의 첫 예약 시 할인
     */
    FIRST_BOOKING("첫 예약 할인", "첫 예약 고객 대상"),
    
    /**
     * 연박 할인
     * 7박 이상 시 추가 할인
     */
    EXTENDED_STAY("연박 할인", "7박 이상 예약 시 추가 할인"),
    
    /**
     * 단체 할인
     * 5인 이상 예약 시 할인
     */
    GROUP("단체 할인", "5인 이상 예약 시 할인");

    private final String displayName;
    private final String description;

    DiscountType(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDescription() {
        return description;
    }
}
