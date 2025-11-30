package com.campstation.camp.campground.domain;

/**
 * 캠핑장 사이트 편의시설 타입
 * 실제 캠핑장에서 제공하는 핵심 편의시설만 포함
 * Bitmask 방식으로 저장하므로 순서 변경 불가 (추가만 가능)
 */
public enum AmenityType {
    // 기본 인프라 (0-7)
    ELECTRICITY("전기"),
    WATER("상수도"),
    SEWER("하수도"),
    WIFI("와이파이"),
    INTERNET("유선 인터넷"),
    PHONE("전화"),
    
    // 위생 시설 (8-15)
    TOILET("화장실"),
    SHOWER("샤워실"),
    SINK("개수대"),
    LAUNDRY("세탁실"),
    WASHING_MACHINE("세탁기"),
    DRYER("건조기"),
    
    // 취사 시설 (16-23)
    BBQ("바베큐 시설"),
    FIRE_PIT("화로대"),
    KITCHEN("공용 주방"),
    MICROWAVE("전자레인지"),
    REFRIGERATOR("냉장고"),
    COOKING_UTENSILS("취사도구"),
    FIREWOOD("장작 제공"),
    
    // 냉난방 (24-27)
    HEATING("난방"),
    AIR_CONDITIONING("에어컨"),
    
    // 숙박 편의 (28-35)
    TENT("텐트 대여"),
    BEDDING("침구류"),
    TV("TV"),
    
    // 접근성 (36-39)
    VEHICLE_ACCESS("차량 진입"),
    PARKING("주차장"),
    
    // 안전/보안 (40-43)
    SECURITY("보안 시설"),
    CCTV("CCTV"),
    FIRST_AID("구급상자"),
    FIRE_EXTINGUISHER("소화기"),
    
    // 부대시설 (44-51)
    STORE("매점"),
    RESTAURANT("식당"),
    PLAYGROUND("놀이터"),
    
    // 레저 시설 (52-59)
    POOL("수영장"),
    GYM("헬스장"),
    
    // 기타 (60-63)
    PET_FRIENDLY("반려동물 동반"),
    GENERATOR("발전기");
    
    private final String description;

    AmenityType(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
    
    /**
     * Bitmask 값 계산
     * @return 비트마스크 값
     */
    public long toBitMask() {
        return 1L << this.ordinal();
    }
    
    /**
     * 여러 편의시설을 비트마스크로 변환
     * @param amenities 편의시설 배열
     * @return 비트마스크 값
     */
    public static long toBitMask(AmenityType... amenities) {
        long mask = 0L;
        for (AmenityType amenity : amenities) {
            mask |= amenity.toBitMask();
        }
        return mask;
    }
    
    /**
     * 비트마스크에서 편의시설 목록 추출
     * @param bitMask 비트마스크 값
     * @return 편의시설 배열
     */
    public static AmenityType[] fromBitMask(long bitMask) {
        return java.util.Arrays.stream(values())
            .filter(amenity -> (bitMask & amenity.toBitMask()) != 0)
            .toArray(AmenityType[]::new);
    }
}
