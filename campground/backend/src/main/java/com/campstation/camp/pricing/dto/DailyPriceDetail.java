package com.campstation.camp.pricing.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 날짜별 요금 상세 정보 DTO
 * 
 * 각 날짜별 요금 계산 내역을 제공
 * 
 * @author CampStation Team
 * @version 1.0
 * @since 2025-01-01
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyPriceDetail {

    /**
     * 날짜
     */
    private LocalDate date;

    /**
     * 해당 날짜의 1박 요금
     */
    private BigDecimal dailyRate;

    /**
     * 적용된 요금제 이름
     */
    private String pricingName;

    /**
     * 주말 여부 (금요일, 토요일)
     */
    private boolean isWeekend;
}
