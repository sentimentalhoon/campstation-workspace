package com.campstation.camp.pricing.domain;

/**
 * 요금 규칙 타입
 * 요금제가 적용되는 기준을 정의
 * 
 * @author CampStation Team
 * @version 1.0
 * @since 2025-01-01
 */
public enum PricingRuleType {
    /**
     * 기본 요금제
     * 사이트의 기본 가격 정책 (항상 적용)
     */
    BASE("기본 요금제", 0),
    
    /**
     * 시즌별 요금제
     * 특정 시즌(성수기/비수기)에 적용
     */
    SEASONAL("시즌별 요금제", 10),
    
    /**
     * 기간 지정 요금제
     * 특정 날짜 범위에만 적용 (명절, 연휴 등)
     */
    DATE_RANGE("기간 지정 요금제", 20),
    
    /**
     * 특별 이벤트 요금제
     * 특정 이벤트 기간에 적용 (최우선)
     */
    SPECIAL_EVENT("특별 이벤트 요금제", 30);

    private final String displayName;
    private final int defaultPriority;

    PricingRuleType(String displayName, int defaultPriority) {
        this.displayName = displayName;
        this.defaultPriority = defaultPriority;
    }

    public String getDisplayName() {
        return displayName;
    }

    public int getDefaultPriority() {
        return defaultPriority;
    }
}
