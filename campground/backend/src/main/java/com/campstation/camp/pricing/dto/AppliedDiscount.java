package com.campstation.camp.pricing.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 적용된 할인 정보 DTO
 * 
 * 예약에 적용된 할인 내역을 제공
 * 
 * @author CampStation Team
 * @version 1.0
 * @since 2025-01-01
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppliedDiscount {

    /**
     * 할인 유형
     * 예: "LONG_STAY", "EXTENDED_STAY", "EARLY_BIRD"
     */
    private String discountType;

    /**
     * 할인율 (백분율)
     * 예: 10 (10% 할인)
     */
    private Integer discountRate;

    /**
     * 할인 금액
     */
    private BigDecimal discountAmount;

    /**
     * 할인 설명
     * 예: "장기 숙박 할인 (3박 이상)"
     */
    private String description;
}
