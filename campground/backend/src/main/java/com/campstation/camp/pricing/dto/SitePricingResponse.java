package com.campstation.camp.pricing.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.campstation.camp.pricing.domain.PricingRuleType;
import com.campstation.camp.pricing.domain.SeasonType;
import com.campstation.camp.pricing.domain.SitePricing;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 사이트 요금제 응답 DTO
 * 
 * @author CampStation Team
 * @version 1.0
 * @since 2025-01-01
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SitePricingResponse {

    private Long id;
    private Long siteId;
    private String siteName;
    private String pricingName;
    private String description;
    private PricingRuleType ruleType;
    
    // 기본 요금
    private BigDecimal basePrice;
    private BigDecimal weekendPrice;
    private String dayMultipliers;
    
    // 인원 정책
    private Integer baseGuests;
    private Integer maxGuests;
    private BigDecimal extraGuestFee;
    
    // 시즌/기간
    private SeasonType seasonType;
    private Integer startMonth;
    private Integer startDay;
    private Integer endMonth;
    private Integer endDay;
    
    // 할인 정책
    private BigDecimal longStayDiscountRate;
    private Integer longStayMinNights;
    private BigDecimal extendedStayDiscountRate;
    private Integer extendedStayMinNights;
    private BigDecimal earlyBirdDiscountRate;
    private Integer earlyBirdMinDays;
    
    // 우선순위 및 상태
    private Integer priority;
    private Boolean isActive;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /**
     * 엔티티 → DTO 변환
     */
    public static SitePricingResponse fromEntity(SitePricing pricing) {
        return SitePricingResponse.builder()
            .id(pricing.getId())
            .siteId(pricing.getSite().getId())
            .siteName(pricing.getSite().getSiteNumber())
            .pricingName(pricing.getPricingName())
            .description(pricing.getDescription())
            .ruleType(pricing.getRuleType())
            .basePrice(pricing.getBasePrice())
            .weekendPrice(pricing.getWeekendPrice())
            .dayMultipliers(pricing.getDayMultipliers())
            .baseGuests(pricing.getBaseGuests())
            .maxGuests(pricing.getMaxGuests())
            .extraGuestFee(pricing.getExtraGuestFee())
            .seasonType(pricing.getSeasonType())
            .startMonth(pricing.getStartMonth())
            .startDay(pricing.getStartDay())
            .endMonth(pricing.getEndMonth())
            .endDay(pricing.getEndDay())
            .longStayDiscountRate(pricing.getLongStayDiscountRate())
            .longStayMinNights(pricing.getLongStayMinNights())
            .extendedStayDiscountRate(pricing.getExtendedStayDiscountRate())
            .extendedStayMinNights(pricing.getExtendedStayMinNights())
            .earlyBirdDiscountRate(pricing.getEarlyBirdDiscountRate())
            .earlyBirdMinDays(pricing.getEarlyBirdMinDays())
            .priority(pricing.getPriority())
            .isActive(pricing.getIsActive())
            .createdAt(pricing.getCreatedAt())
            .updatedAt(pricing.getUpdatedAt())
            .build();
    }
}
