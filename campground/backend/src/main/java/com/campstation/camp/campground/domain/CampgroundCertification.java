package com.campstation.camp.campground.domain;

/**
 * 캠핑장 인증/등급 타입
 */
public enum CampgroundCertification {
    PREMIUM("프리미엄"),    // 플랫폼 인증 프리미엄
    CERTIFIED("공식 인증"), // 정부/공사 공식 인증
    STANDARD("일반"),      // 일반 캠핑장
    NEW("신규");           // 신규 등록

    private final String description;

    CampgroundCertification(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
