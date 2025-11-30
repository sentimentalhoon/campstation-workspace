package com.campstation.camp.pricing.domain;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;

import com.campstation.camp.campground.domain.Site;
import com.campstation.camp.shared.domain.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 사이트 요금제 엔티티
 * 
 * 캠핑장 사이트별로 다양한 요금 정책을 설정할 수 있는 유연한 요금제 시스템
 * Owner가 시즌별, 요일별, 기간별로 차별화된 요금을 설정 가능
 * 
 * 주요 기능:
 * - 기본 요금 설정 (평일/주말 차등)
 * - 시즌별 요금 설정 (성수기/비수기)
 * - 특정 기간 요금 설정 (명절, 이벤트)
 * - 요일별 배율 설정
 * - 인원 정책 설정 (기준 인원, 추가 인원 요금)
 * - 우선순위 기반 요금 적용
 * 
 * @author CampStation Team
 * @version 1.0
 * @since 2025-01-01
 */
@Entity
@Table(name = "site_pricing")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SitePricing extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 요금제가 적용될 사이트
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "site_id", nullable = false)
    private Site site;

    // ==================== 요금제 기본 정보 ====================

    /**
     * 요금제 이름
     * 예: "여름 성수기 요금", "주말 특가", "연휴 특별 요금"
     */
    @Column(name = "pricing_name", length = 100, nullable = false)
    private String pricingName;

    /**
     * 요금제 설명
     */
    @Column(name = "description", length = 500)
    private String description;

    /**
     * 요금 규칙 타입
     * BASE: 기본 요금제
     * SEASONAL: 시즌별 요금제
     * DATE_RANGE: 기간 지정 요금제
     * SPECIAL_EVENT: 특별 이벤트 요금제
     */
    @Column(name = "rule_type", nullable = false)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private PricingRuleType ruleType = PricingRuleType.BASE;

    // ==================== 기본 요금 정보 ====================

    /**
     * 1박 기본 요금 (평일)
     */
    @Column(name = "base_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal basePrice;

    /**
     * 주말 요금 (금~토)
     * null이면 basePrice 사용
     */
    @Column(name = "weekend_price", precision = 10, scale = 2)
    private BigDecimal weekendPrice;

    /**
     * 요일별 가격 배율
     * 예: {"MONDAY": 0.9, "FRIDAY": 1.2, "SATURDAY": 1.5}
     * null이면 평일/주말 구분만 적용
     */
    @Column(name = "day_multipliers", columnDefinition = "TEXT")
    private String dayMultipliers; // JSON 문자열로 저장

    // ==================== 인원 정책 ====================

    /**
     * 기준 인원
     * 이 인원까지는 추가 요금 없음
     */
    @Column(name = "base_guests", nullable = false)
    @Builder.Default
    private Integer baseGuests = 2;

    /**
     * 최대 인원
     * 이 인원을 초과하는 예약은 불가
     */
    @Column(name = "max_guests", nullable = false)
    @Builder.Default
    private Integer maxGuests = 4;

    /**
     * 추가 인원당 요금
     * baseGuests 초과 시 1인당 추가 요금
     */
    @Column(name = "extra_guest_fee", precision = 10, scale = 2)
    private BigDecimal extraGuestFee;

    // ==================== 시즌/기간 설정 ====================

    /**
     * 시즌 타입
     * PEAK: 성수기
     * HIGH: 준성수기
     * NORMAL: 평시
     * LOW: 비수기
     */
    @Column(name = "season_type")
    @Enumerated(EnumType.STRING)
    private SeasonType seasonType;

    /**
     * 적용 시작 월 (1-12)
     * 특정 기간 요금제의 경우 필수
     */
    @Column(name = "start_month")
    private Integer startMonth;

    /**
     * 적용 시작 일 (1-31)
     * 특정 기간 요금제의 경우 필수
     */
    @Column(name = "start_day")
    private Integer startDay;

    /**
     * 적용 종료 월 (1-12)
     * 특정 기간 요금제의 경우 필수
     */
    @Column(name = "end_month")
    private Integer endMonth;

    /**
     * 적용 종료 일 (1-31)
     * 특정 기간 요금제의 경우 필수
     */
    @Column(name = "end_day")
    private Integer endDay;

    // ==================== 할인 정책 ====================

    /**
     * 장기 숙박 할인율 (%)
     * 3박 이상 시 적용
     * 예: 5.0 = 5% 할인
     */
    @Column(name = "long_stay_discount_rate", precision = 5, scale = 2)
    private BigDecimal longStayDiscountRate;

    /**
     * 장기 숙박 할인 최소 박수
     * 기본값: 3박
     */
    @Column(name = "long_stay_min_nights")
    @Builder.Default
    private Integer longStayMinNights = 3;

    /**
     * 연박 할인율 (%)
     * 7박 이상 시 추가 할인
     */
    @Column(name = "extended_stay_discount_rate", precision = 5, scale = 2)
    private BigDecimal extendedStayDiscountRate;

    /**
     * 연박 할인 최소 박수
     * 기본값: 7박
     */
    @Column(name = "extended_stay_min_nights")
    @Builder.Default
    private Integer extendedStayMinNights = 7;

    /**
     * 조기 예약 할인율 (%)
     * 체크인 N일 전 예약 시 적용
     */
    @Column(name = "early_bird_discount_rate", precision = 5, scale = 2)
    private BigDecimal earlyBirdDiscountRate;

    /**
     * 조기 예약 할인 최소 일수
     * 기본값: 30일
     */
    @Column(name = "early_bird_min_days")
    @Builder.Default
    private Integer earlyBirdMinDays = 30;

    // ==================== 우선순위 및 상태 ====================

    /**
     * 우선순위
     * 여러 요금제가 겹칠 때 높은 숫자가 우선 적용
     * BASE: 0, SEASONAL: 10, DATE_RANGE: 20, SPECIAL_EVENT: 30
     */
    @Column(name = "priority", nullable = false)
    @Builder.Default
    private Integer priority = 0;

    /**
     * 활성화 여부
     * false면 이 요금제는 적용되지 않음
     */
    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    // ==================== 비즈니스 로직 ====================

    /**
     * 특정 날짜에 이 요금제가 적용 가능한지 확인
     * 
     * @param date 확인할 날짜
     * @return 적용 가능 여부
     */
    public boolean isApplicableOn(LocalDate date) {
        if (!isActive) {
            return false;
        }

        // 기간 지정 요금제인 경우 월-일 범위 확인 (년도 무시)
        if (startMonth != null && startDay != null && endMonth != null && endDay != null) {
            return isDateInMonthDayRange(date, startMonth, startDay, endMonth, endDay);
        }

        // 시즌 요금제인 경우 시즌 매칭 확인
        if (seasonType != null) {
            return matchesSeason(date);
        }

        // 기본 요금제는 항상 적용 가능
        return ruleType == PricingRuleType.BASE;
    }

    /**
     * 특정 날짜가 월-일 범위 내에 있는지 확인 (년도 무시, 년을 넘어가는 범위 지원)
     * 예: 12/15 ~ 02/28은 12월 15일부터 다음 해 2월 28일까지
     * 
     * @param date 확인할 날짜
     * @param startMonth 시작 월 (1-12)
     * @param startDay 시작 일 (1-31)
     * @param endMonth 종료 월 (1-12)
     * @param endDay 종료 일 (1-31)
     * @return 범위 내 포함 여부
     */
    private boolean isDateInMonthDayRange(LocalDate date, int startMonth, int startDay, int endMonth, int endDay) {
        int month = date.getMonthValue();
        int day = date.getDayOfMonth();
        
        // 시작 월-일과 종료 월-일을 비교 가능한 정수로 변환 (MMDD)
        int currentMonthDay = month * 100 + day;
        int startMonthDay = startMonth * 100 + startDay;
        int endMonthDay = endMonth * 100 + endDay;
        
        // 년을 넘어가지 않는 경우 (예: 03/01 ~ 11/30)
        if (startMonthDay <= endMonthDay) {
            return currentMonthDay >= startMonthDay && currentMonthDay <= endMonthDay;
        } 
        // 년을 넘어가는 경우 (예: 12/15 ~ 02/28)
        else {
            return currentMonthDay >= startMonthDay || currentMonthDay <= endMonthDay;
        }
    }

    /**
     * 날짜가 설정된 시즌과 일치하는지 확인
     * 
     * @param date 확인할 날짜
     * @return 시즌 일치 여부
     */
    private boolean matchesSeason(LocalDate date) {
        int month = date.getMonthValue();
        
        return switch (seasonType) {
            case PEAK -> month >= 7 && month <= 8; // 7~8월
            case HIGH -> month == 4 || month == 5 || month == 9 || month == 10; // 4~5월, 9~10월
            case LOW -> month == 1 || month == 2 || month == 12; // 12~2월
            case NORMAL -> true; // 그 외 모든 기간
        };
    }

    /**
     * 특정 요일의 1박 요금 계산
     * 
     * @param dayOfWeek 요일
     * @return 해당 요일의 1박 요금
     */
    public BigDecimal getDailyRate(DayOfWeek dayOfWeek) {
        BigDecimal rate;

        // 1. 요일별 배율이 설정되어 있으면 적용
        if (dayMultipliers != null && !dayMultipliers.isBlank()) {
            BigDecimal multiplier = parseDayMultiplier(dayOfWeek);
            if (multiplier != null) {
                return basePrice.multiply(multiplier);
            }
        }

        // 2. 주말 요금 적용 (금요일, 토요일)
        if (isWeekend(dayOfWeek) && weekendPrice != null) {
            rate = weekendPrice;
        } else {
            rate = basePrice;
        }

        return rate;
    }

    /**
     * 요일별 배율 파싱
     * 
     * @param dayOfWeek 요일
     * @return 배율 (없으면 null)
     */
    private BigDecimal parseDayMultiplier(DayOfWeek dayOfWeek) {
        // 간단한 파싱 (실제로는 JSON 라이브러리 사용 권장)
        if (dayMultipliers.contains(dayOfWeek.name())) {
            try {
                // "MONDAY": 0.9 형태에서 숫자 추출
                String key = "\"" + dayOfWeek.name() + "\":";
                int startIdx = dayMultipliers.indexOf(key);
                if (startIdx >= 0) {
                    startIdx += key.length();
                    int endIdx = dayMultipliers.indexOf(",", startIdx);
                    if (endIdx < 0) {
                        endIdx = dayMultipliers.indexOf("}", startIdx);
                    }
                    String value = dayMultipliers.substring(startIdx, endIdx).trim();
                    return new BigDecimal(value);
                }
            } catch (Exception e) {
                // 파싱 실패 시 null 반환
            }
        }
        return null;
    }

    /**
     * 주말 여부 확인
     * 
     * @param day 요일
     * @return 주말 여부 (금요일, 토요일을 주말로 간주)
     */
    private boolean isWeekend(DayOfWeek day) {
        return day == DayOfWeek.FRIDAY || day == DayOfWeek.SATURDAY;
    }

    /**
     * 인원에 따른 추가 요금 계산
     * 
     * @param numberOfGuests 총 인원
     * @return 추가 인원 요금
     */
    public BigDecimal calculateExtraGuestFee(Integer numberOfGuests) {
        if (numberOfGuests == null || numberOfGuests <= baseGuests || extraGuestFee == null) {
            return BigDecimal.ZERO;
        }

        int extraGuests = numberOfGuests - baseGuests;
        return extraGuestFee.multiply(BigDecimal.valueOf(extraGuests));
    }

    /**
     * 장기 숙박 할인율 계산
     * 
     * @param numberOfNights 총 숙박일수
     * @return 적용 가능한 할인율 (0~1 사이)
     */
    public BigDecimal getLongStayDiscountRate(Integer numberOfNights) {
        if (numberOfNights == null) {
            return BigDecimal.ZERO;
        }

        // 연박 할인 (7박 이상) - 더 높은 할인율
        if (extendedStayDiscountRate != null && 
            extendedStayMinNights != null && 
            numberOfNights >= extendedStayMinNights) {
            return extendedStayDiscountRate.divide(BigDecimal.valueOf(100));
        }

        // 장기 숙박 할인 (3박 이상)
        if (longStayDiscountRate != null && 
            longStayMinNights != null && 
            numberOfNights >= longStayMinNights) {
            return longStayDiscountRate.divide(BigDecimal.valueOf(100));
        }

        return BigDecimal.ZERO;
    }

    /**
     * 조기 예약 할인율 계산
     * 
     * @param daysBeforeCheckIn 체크인까지 남은 일수
     * @return 적용 가능한 할인율 (0~1 사이)
     */
    public BigDecimal getEarlyBirdDiscountRate(Long daysBeforeCheckIn) {
        if (earlyBirdDiscountRate != null && 
            earlyBirdMinDays != null && 
            daysBeforeCheckIn >= earlyBirdMinDays) {
            return earlyBirdDiscountRate.divide(BigDecimal.valueOf(100));
        }
        return BigDecimal.ZERO;
    }
}
