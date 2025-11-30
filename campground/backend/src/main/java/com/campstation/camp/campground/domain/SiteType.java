package com.campstation.camp.campground.domain;

/**
 * 캠핑 사이트 유형을 나타내는 열거형
 */
public enum SiteType {
    /**
     * 텐트 사이트
     */
    TENT("텐트 사이트"),

    /**
     * RV 사이트
     */
    RV("RV 사이트"),

    /**
     * 카라반 사이트
     */
    CARAVAN("카라반 사이트"),

    /**
     * 글램핑
     */
    GLAMPING("글램핑"),

    /**
     * 오토캠핑
     */
    AUTO_CAMPING("오토캠핑"),

    /**
     * 캠핑 카빈 (나무 오두막형 숙소)
     */
    CABIN("캠핑 카빈"),

    /**
     * 펜션 (독립된 건물형 숙소)
     */
    PENSION("펜션"),

    /**
     * 컨테이너 (개조된 컨테이너 숙소)
     */
    CONTAINER("컨테이너"),

    /**
     * 데크 캠핑 (나무 데크 위 텐트)
     */
    DECK_CAMPING("데크 캠핑"),

    /**
     * 단체 사이트 (여러 팀이 함께 사용)
     */
    GROUP_SITE("단체 사이트"),

    /**
     * 독립형 사이트 (프라이빗 공간)
     */
    PRIVATE_SITE("독립형 사이트"),

    /**
     * 호숫가 사이트 (워터프론트)
     */
    LAKESIDE("호숫가 사이트"),

    /**
     * 반려동물 동반 사이트
     */
    DOG_FRIENDLY("반려동물 동반 사이트");

    private final String description;

    SiteType(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}