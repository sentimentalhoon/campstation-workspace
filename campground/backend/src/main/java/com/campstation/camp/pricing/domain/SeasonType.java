package com.campstation.camp.pricing.domain;

/**
 * 시즌 타입
 * 계절별 요금제 차등 적용을 위한 enum
 * 
 * @author CampStation Team
 * @version 1.0
 * @since 2025-01-01
 */
public enum SeasonType {
    /**
     * 성수기 (여름 휴가철: 7~8월)
     * 가장 높은 요금 적용
     */
    PEAK("성수기", "여름 휴가철"),
    
    /**
     * 준성수기 (봄/가을: 4~5월, 9~10월)
     * 중간 수준의 요금 적용
     */
    HIGH("준성수기", "봄/가을"),
    
    /**
     * 평시 (3월, 6월, 11월)
     * 기본 요금 적용
     */
    NORMAL("평시", "일반 시즌"),
    
    /**
     * 비수기 (한겨울: 12~2월)
     * 할인 요금 적용
     */
    LOW("비수기", "한겨울");

    private final String displayName;
    private final String description;

    SeasonType(String displayName, String description) {
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
