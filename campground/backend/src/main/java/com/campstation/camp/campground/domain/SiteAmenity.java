package com.campstation.camp.campground.domain;

import jakarta.persistence.*;

import com.campstation.camp.shared.domain.BaseEntity;

/**
 * 사이트 편의시설 엔티티
 * Site의 amenities를 정규화하여 1:N 관계로 관리
 */
@Entity
@Table(name = "site_amenities")
public class SiteAmenity extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "site_id", nullable = false)
    private Site site;

    @Enumerated(EnumType.STRING)
    @Column(name = "amenity_type", nullable = false)
    private AmenityType amenityType;

    @Column(name = "available", nullable = false)
    private Boolean available = false;

    // id, createdAt, updatedAt are inherited from BaseEntity

    /**
     * 편의시설 타입 열거형
     */
    public enum AmenityType {
        // 기본 편의시설
        ELECTRICITY("전기"),
        WATER("상수도"),
        SEWER("하수도"),
        WIFI("와이파이"),
        
        // 시설 편의시설
        TOILET("화장실"),
        SHOWER("샤워실"),
        SINK("개수대"),
        BBQ("바베큐 시설"),
        FIRE_PIT("화로대"),
        HEATING("난방"),
        AIR_CONDITIONING("에어컨"),
        TV("TV"),
        REFRIGERATOR("냉장고"),
        MICROWAVE("전자레인지"),
        COOKING_UTENSILS("취사도구"),
        TENT("텐트"),
        VEHICLE_ACCESS("차량 진입"),
        PET_FRIENDLY("반려동물 동반"),
        FIREWOOD("장작"),
        PLAYGROUND("놀이터"),
        POOL("수영장"),
        GYM("헬스장"),
        LAUNDRY("세탁실"),
        STORE("매점"),
        RESTAURANT("식당"),
        KITCHEN("주방"),
        WASHING_MACHINE("세탁기"),
        DRYER("건조기"),
        PARKING("주차장"),
        SECURITY("보안시설"),
        FIRST_AID("구급상자"),
        FIRE_EXTINGUISHER("소화기"),
        CCTV("CCTV"),
        GENERATOR("발전기"),
        SOLAR_POWER("태양광 발전"),
        WIND_POWER("풍력 발전"),
        BATTERY_BACKUP("배터리 백업"),
        INTERNET("인터넷"),
        PHONE("전화"),
        FAX("팩스"),
        MAILBOX("우편함"),
        NEWSPAPER("신문"),
        MAGAZINE("잡지"),
        BOOKS("도서"),
        GAMES("게임"),
        MOVIES("영화"),
        MUSIC("음악"),
        DANCE("댄스"),
        KARAOKE("노래방"),
        BILLIARDS("당구"),
        TABLE_TENNIS("탁구"),
        BADMINTON("배드민턴"),
        TENNIS("테니스"),
        SOCCER("축구"),
        BASKETBALL("농구"),
        VOLLEYBALL("배구"),
        BASEBALL("야구"),
        GOLF("골프"),
        BIKING("자전거"),
        HIKING("등산"),
        FISHING("낚시"),
        BOATING("보트"),
        SWIMMING("수영"),
        DIVING("다이빙"),
        SNORKELING("스노클링"),
        SURFING("서핑"),
        SKIING("스키"),
        SNOWBOARDING("스노보드"),
        HORSE_RIDING("승마"),
        ZIPLINE("짚라인"),
        ROCK_CLIMBING("암벽등반"),
        PARAGLIDING("패러글라이딩"),
        HOT_AIR_BALLOON("열기구"),
        HELICOPTER_TOUR("헬리콥터 투어"),
        SAUNA("사우나"),
        JACUZZI("자쿠지"),
        MASSAGE("마사지"),
        SPA("스파"),
        YOGA("요가"),
        MEDITATION("명상"),
        PILATES("필라테스"),
        TAICHI("태극권"),
        MARTIAL_ARTS("무술"),
        BOXING("복싱"),
        KARATE("가라테"),
        JUDO("유도"),
        TAEKWONDO("태권도"),
        KICKBOXING("킥복싱"),
        MMA("종합격투기"),
        WRESTLING("레슬링"),
        WEIGHTLIFTING("역도"),
        BODYBUILDING("보디빌딩"),
        CROSSFIT("크로스핏"),
        RUNNING("달리기"),
        CYCLING("사이클링"),
        SWIMMING_POOL("수영장"),
        TENNIS_COURT("테니스 코트"),
        BASKETBALL_COURT("농구 코트"),
        VOLLEYBALL_COURT("배구 코트"),
        SOCCER_FIELD("축구장"),
        BASEBALL_FIELD("야구장"),
        GOLF_COURSE("골프 코스"),
        BIKE_PATH("자전거 도로"),
        HIKING_TRAIL("등산로"),
        FISHING_POND("낚시 연못"),
        BOAT_DOCK("보트 선착장"),
        DIVING_CENTER("다이빙 센터"),
        SURF_SCHOOL("서핑 학교"),
        SKI_RESORT("스키 리조트"),
        SNOWBOARD_PARK("스노보드 파크"),
        HORSE_STABLES("마구간"),
        ZIPLINE_COURSE("짚라인 코스"),
        ROCK_CLIMBING_WALL("암벽등반 벽"),
        PARAGLIDING_SCHOOL("패러글라이딩 학교"),
        HOT_AIR_BALLOON_RIDES("열기구 탑승"),
        HELICOPTER_TOURS("헬리콥터 투어");

        private final String description;

        AmenityType(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }
    
    // Setter for site relationship
    public void setSite(Site site) {
        this.site = site;
    }

    // Getters and Setters
    public Site getSite() {
        return site;
    }

    public AmenityType getAmenityType() {
        return amenityType;
    }

    public void setAmenityType(AmenityType amenityType) {
        this.amenityType = amenityType;
    }

    public Boolean getAvailable() {
        return available;
    }

    public void setAvailable(Boolean available) {
        this.available = available;
    }

    // Builder pattern
    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Site site;
        private AmenityType amenityType;
        private Boolean available = false;

        public Builder site(Site site) {
            this.site = site;
            return this;
        }

        public Builder amenityType(AmenityType amenityType) {
            this.amenityType = amenityType;
            return this;
        }

        public Builder available(Boolean available) {
            this.available = available;
            return this;
        }

        public SiteAmenity build() {
            SiteAmenity amenity = new SiteAmenity();
            amenity.setSite(site);
            amenity.setAmenityType(amenityType);
            amenity.setAvailable(available);
            return amenity;
        }
    }
}