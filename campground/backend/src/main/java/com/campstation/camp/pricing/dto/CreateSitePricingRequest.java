package com.campstation.camp.pricing.dto;

import java.math.BigDecimal;

import com.campstation.camp.pricing.domain.PricingRuleType;
import com.campstation.camp.pricing.domain.SeasonType;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 사이트 요금제 생성 요청 DTO
 * 
 * @author CampStation Team
 * @version 1.0
 * @since 2025-01-01
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateSitePricingRequest {

    /**
     * 요금제 이름
     */
    @NotBlank(message = "요금제 이름은 필수입니다")
    @Size(max = 100, message = "요금제 이름은 100자 이하여야 합니다")
    private String pricingName;

    /**
     * 요금제 설명
     */
    @Size(max = 500, message = "설명은 500자 이하여야 합니다")
    private String description;

    /**
     * 요금 규칙 타입
     */
    @NotNull(message = "요금 규칙 타입은 필수입니다")
    private PricingRuleType ruleType;

    // ==================== 기본 요금 정보 ====================

    /**
     * 1박 기본 요금
     */
    @NotNull(message = "기본 요금은 필수입니다")
    @DecimalMin(value = "0.0", message = "기본 요금은 0 이상이어야 합니다")
    private BigDecimal basePrice;

    /**
     * 주말 요금 (옵션)
     */
    @DecimalMin(value = "0.0", message = "주말 요금은 0 이상이어야 합니다")
    private BigDecimal weekendPrice;

    /**
     * 요일별 가격 배율 (JSON 문자열)
     * 예: {"MONDAY": 0.9, "FRIDAY": 1.2, "SATURDAY": 1.5}
     */
    private String dayMultipliers;

    // ==================== 인원 정책 ====================

    /**
     * 기준 인원
     */
    @NotNull(message = "기준 인원은 필수입니다")
    @Min(value = 1, message = "기준 인원은 1명 이상이어야 합니다")
    private Integer baseGuests;

    /**
     * 최대 인원
     */
    @NotNull(message = "최대 인원은 필수입니다")
    @Min(value = 1, message = "최대 인원은 1명 이상이어야 합니다")
    private Integer maxGuests;

    /**
     * 추가 인원당 요금
     */
    @DecimalMin(value = "0.0", message = "추가 인원 요금은 0 이상이어야 합니다")
    private BigDecimal extraGuestFee;

    // ==================== 시즌/기간 설정 ====================

    /**
     * 시즌 타입
     */
    private SeasonType seasonType;

    /**
     * 적용 시작 월 (1-12)
     */
    @Min(value = 1, message = "시작 월은 1 이상이어야 합니다")
    private Integer startMonth;

    /**
     * 적용 시작 일 (1-31)
     */
    @Min(value = 1, message = "시작 일은 1 이상이어야 합니다")
    private Integer startDay;

    /**
     * 적용 종료 월 (1-12)
     */
    @Min(value = 1, message = "종료 월은 1 이상이어야 합니다")
    private Integer endMonth;

    /**
     * 적용 종료 일 (1-31)
     */
    @Min(value = 1, message = "종료 일은 1 이상이어야 합니다")
    private Integer endDay;

    // ==================== 할인 정책 ====================

    /**
     * 장기 숙박 할인율 (%)
     */
    @DecimalMin(value = "0.0", message = "할인율은 0 이상이어야 합니다")
    private BigDecimal longStayDiscountRate;

    /**
     * 장기 숙박 할인 최소 박수
     */
    @Min(value = 1, message = "최소 박수는 1 이상이어야 합니다")
    private Integer longStayMinNights;

    /**
     * 연박 할인율 (%)
     */
    @DecimalMin(value = "0.0", message = "할인율은 0 이상이어야 합니다")
    private BigDecimal extendedStayDiscountRate;

    /**
     * 연박 할인 최소 박수
     */
    @Min(value = 1, message = "최소 박수는 1 이상이어야 합니다")
    private Integer extendedStayMinNights;

    /**
     * 조기 예약 할인율 (%)
     */
    @DecimalMin(value = "0.0", message = "할인율은 0 이상이어야 합니다")
    private BigDecimal earlyBirdDiscountRate;

    /**
     * 조기 예약 할인 최소 일수
     */
    @Min(value = 1, message = "최소 일수는 1 이상이어야 합니다")
    private Integer earlyBirdMinDays;

    // ==================== 우선순위 및 상태 ====================

    /**
     * 우선순위
     */
    @NotNull(message = "우선순위는 필수입니다")
    @Min(value = 0, message = "우선순위는 0 이상이어야 합니다")
    private Integer priority;

    /**
     * 활성화 여부
     */
    @NotNull(message = "활성화 여부는 필수입니다")
    private Boolean isActive;
}
