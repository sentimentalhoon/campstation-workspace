package com.campstation.camp.campground.domain;

/**
 * 캠핑 사이트 상태를 나타내는 열거형
 */
public enum SiteStatus {
    /**
     * 예약 가능
     */
    AVAILABLE("예약 가능"),
    
    /**
     * 점검 중
     */
    MAINTENANCE("점검 중"),
    
    /**
     * 사용 불가
     */
    UNAVAILABLE("사용 불가");

    private final String description;

    SiteStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}