package com.campstation.camp.campground.domain;

/**
 * 캠핑장 운영 주체 타입
 */
public enum CampgroundOperationType {
    DIRECT("직영"),      // 플랫폼 직접 운영
    PARTNER("제휴"),     // 제휴 파트너 운영
    PRIVATE("개인"),     // 개인 사업자 운영
    FRANCHISE("프랜차이즈"); // 프랜차이즈 체인

    private final String description;

    CampgroundOperationType(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
