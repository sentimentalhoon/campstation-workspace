package com.campstation.camp.pricing.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 가격 상세 내역 DTO
 * 
 * 예약 가격 계산 시 각 항목별 상세 내역을 제공
 * 사용자가 요금이 어떻게 계산되었는지 명확히 이해할 수 있도록 함
 * 
 * @author CampStation Team
 * @version 1.0
 * @since 2025-01-01
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PriceBreakdown {

    /**
     * 사이트 ID
     */
    private Long siteId;

    /**
     * 체크인 날짜
     */
    private LocalDate checkInDate;

    /**
     * 체크아웃 날짜
     */
    private LocalDate checkOutDate;

    /**
     * 숙박 일수
     */
    private Integer numberOfNights;

    /**
     * 총 인원
     */
    private Integer numberOfGuests;

    /**
     * 기본 숙박 요금 (날짜별 요금 합계)
     */
    private BigDecimal basePrice;

    /**
     * 추가 인원 요금
     */
    private BigDecimal extraGuestFee;

    /**
     * 소계 (기본 요금 + 추가 인원 요금)
     */
    private BigDecimal subtotal;

    /**
     * 총 할인 금액
     */
    private BigDecimal totalDiscount;

    /**
     * 최종 결제 금액
     */
    private BigDecimal totalAmount;

    /**
     * 날짜별 요금 상세 내역
     */
    private List<DailyPriceDetail> dailyBreakdown;

    /**
     * 적용된 할인 내역
     */
    private List<AppliedDiscount> appliedDiscounts;
}
