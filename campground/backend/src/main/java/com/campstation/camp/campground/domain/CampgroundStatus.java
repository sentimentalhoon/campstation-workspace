package com.campstation.camp.campground.domain;

/**
 * 캠핑장 운영 상태를 나타내는 열거형
 */
public enum CampgroundStatus {
    /**
     * 운영 중
     */
    ACTIVE("운영 중"),
    
    /**
     * 휴업
     */
    INACTIVE("휴업"),
    
    /**
     * 임시 휴업
     */
    MAINTENANCE("정비 중"),
    
    /**
     * 폐업
     */
    CLOSED("폐업");

    private final String description;

    CampgroundStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}