package com.campstation.camp.reservation.domain;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import com.campstation.camp.pricing.domain.PriceItemType;
import com.campstation.camp.pricing.domain.SitePricing;

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
 * 예약 가격 항목 엔티티
 * 예약 금액의 상세 내역을 저장 (분석/리포팅용)
 *
 * @author CampStation Team
 * @version 1.0
 * @since 2025-01-01
 */
@Entity
@Table(name = "reservation_price_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReservationPriceItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 소속 예약
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reservation_id", nullable = false)
    private Reservation reservation;

    /**
     * 항목 타입
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "item_type", nullable = false, length = 50)
    private PriceItemType itemType;

    /**
     * 항목 이름 (사용자에게 표시될 이름)
     * 예: "기본 요금 (2박)", "주말 할증 (금요일)", "추가 인원 (1명)"
     */
    @Column(name = "item_name", nullable = false, length = 100)
    private String itemName;

    /**
     * 수량 (박수, 인원 등)
     */
    @Column(name = "quantity", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal quantity = BigDecimal.ONE;

    /**
     * 단가
     */
    @Column(name = "unit_price", precision = 10, scale = 2, nullable = false)
    private BigDecimal unitPrice;

    /**
     * 총액 (quantity * unitPrice)
     * 할인의 경우 음수
     */
    @Column(name = "amount", precision = 10, scale = 2, nullable = false)
    private BigDecimal amount;

    /**
     * 표시 순서 (화면에 보여줄 순서)
     */
    @Column(name = "display_order")
    @Builder.Default
    private Integer displayOrder = 0;

    /**
     * 적용된 요금제 (참조용, nullable)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "applied_pricing_id")
    private SitePricing appliedPricing;

    /**
     * 생성 일시
     */
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * 금액이 할인인지 확인
     *
     * @return 할인이면 true
     */
    public boolean isDiscount() {
        return itemType.isDiscount();
    }

    /**
     * 금액이 할증인지 확인
     *
     * @return 할증이면 true
     */
    public boolean isSurcharge() {
        return itemType.isSurcharge();
    }

    /**
     * 절대값 금액 반환
     *
     * @return 절대값
     */
    public BigDecimal getAbsoluteAmount() {
        return amount.abs();
    }
}
