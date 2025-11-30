package com.campstation.camp.reservation.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import com.campstation.camp.pricing.domain.PriceItemType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 가격 상세 내역 DTO
 * JSONB 컬럼에 저장될 스냅샷 데이터
 *
 * @author CampStation Team
 * @version 1.0
 * @since 2025-01-01
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PriceBreakdownDto {

    /**
     * 기본 요금 총액
     */
    private BigDecimal basePrice;

    /**
     * 주말 할증 총액
     */
    @Builder.Default
    private BigDecimal weekendSurcharge = BigDecimal.ZERO;

    /**
     * 추가 인원 요금 총액
     */
    @Builder.Default
    private BigDecimal extraGuestFee = BigDecimal.ZERO;

    /**
     * 총 할인 금액 (음수)
     */
    @Builder.Default
    private BigDecimal totalDiscount = BigDecimal.ZERO;

    /**
     * 총 할증 금액
     */
    @Builder.Default
    private BigDecimal totalSurcharge = BigDecimal.ZERO;

    /**
     * 최종 결제 금액
     */
    private BigDecimal totalAmount;

    /**
     * 상세 항목 목록
     */
    @Builder.Default
    private List<PriceItemDto> items = new ArrayList<>();

    /**
     * 가격 항목 DTO
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PriceItemDto {
        /**
         * 항목 타입
         */
        private PriceItemType type;

        /**
         * 항목 이름
         */
        private String name;

        /**
         * 수량
         */
        @Builder.Default
        private BigDecimal quantity = BigDecimal.ONE;

        /**
         * 단가
         */
        private BigDecimal unitPrice;

        /**
         * 총액
         */
        private BigDecimal amount;

        /**
         * 표시 순서
         */
        @Builder.Default
        private Integer displayOrder = 0;

        /**
         * 적용된 요금제 ID (참조용)
         */
        private Long appliedPricingId;
    }

    /**
     * 항목 추가 헬퍼 메서드
     *
     * @param item 추가할 항목
     */
    public void addItem(PriceItemDto item) {
        this.items.add(item);

        // 할인 항목만 자동 집계
        if (item.getType().isDiscount()) {
            this.totalDiscount = this.totalDiscount.add(item.getAmount());
        }
        // 주말 할증과 추가 인원은 weekendSurcharge, extraGuestFee로 직접 관리됨
    }

    /**
     * 최종 금액 계산
     */
    public void calculateTotalAmount() {
        this.totalAmount = this.basePrice
            .add(this.weekendSurcharge)
            .add(this.extraGuestFee)
            .add(this.totalDiscount); // totalDiscount는 음수
    }
}
