package com.campstation.camp.reservation.domain;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.campstation.camp.shared.domain.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 환불 내역 엔티티
 * 결제 환불 정보를 저장하는 데이터베이스 엔티티
 * Toss Payments 환불 응답 구조와 호환되도록 설계
 *
 * @author CampStation Team
 * @version 2.0
 * @since 2025-10-28
 */
@Entity
@Table(name = "refunds")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Refund extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_id", nullable = false)
    private Payment payment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reservation_id", nullable = false)
    private Reservation reservation;

    @Column(nullable = false)
    private Long userId;

    // ===== 기본 환불 정보 =====
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal refundAmount; // 실제 환불 금액 (cancelAmount)

    @Column(nullable = false, length = 500)
    private String refundReason; // 환불 사유 (cancelReason)

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private RefundStatus status;

    @Column(length = 100)
    private String refundTransactionId; // transactionKey

    @Column
    private LocalDateTime refundedAt; // canceledAt

    @Column(length = 1000)
    private String failureReason;

    @Column(nullable = false)
    private Long processedBy; // 환불 처리한 사용자 ID (오너 또는 관리자)

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private RefundType refundType; // USER (사용자 요청) 또는 OWNER (오너 처리)

    // ===== Toss Payments 환불 상세 정보 =====
    @Column(length = 50)
    private String cancelStatus; // DONE, PROCESSING 등
    
    @Column(length = 100)
    private String cancelRequestId; // 취소 요청 ID
    
    @Column(precision = 10, scale = 2)
    private BigDecimal taxFreeAmount; // 면세 금액
    
    @Column(precision = 10, scale = 2)
    private BigDecimal taxExemptionAmount; // 과세 제외 금액
    
    @Column(precision = 10, scale = 2)
    private BigDecimal refundableAmount; // 환불 가능 잔액
    
    @Column(precision = 10, scale = 2)
    private BigDecimal cardDiscountAmount; // 카드사 할인 금액
    
    @Column(precision = 10, scale = 2)
    private BigDecimal transferDiscountAmount; // 계좌이체 할인 금액
    
    @Column(precision = 10, scale = 2)
    private BigDecimal easyPayDiscountAmount; // 간편결제 할인 금액
    
    @Column(length = 100)
    private String receiptKey; // 영수증 키

    // ===== 결제 원본 정보 (부분 취소 추적용) =====
    @Column(precision = 10, scale = 2)
    private BigDecimal totalAmount; // 원래 결제 총액
    
    @Column(precision = 10, scale = 2)
    private BigDecimal balanceAmount; // 환불 후 잔액
    
    @Column(length = 50)
    private String paymentStatus; // PARTIAL_CANCELED, CANCELED 등

    @Builder
    public Refund(Payment payment, Reservation reservation, Long userId, BigDecimal refundAmount,
                  String refundReason, RefundStatus status, String refundTransactionId,
                  LocalDateTime refundedAt, Long processedBy, RefundType refundType,
                  String cancelStatus, String cancelRequestId, BigDecimal taxFreeAmount,
                  BigDecimal taxExemptionAmount, BigDecimal refundableAmount,
                  BigDecimal cardDiscountAmount, BigDecimal transferDiscountAmount,
                  BigDecimal easyPayDiscountAmount, String receiptKey,
                  BigDecimal totalAmount, BigDecimal balanceAmount, String paymentStatus) {
        this.payment = payment;
        this.reservation = reservation;
        this.userId = userId;
        this.refundAmount = refundAmount;
        this.refundReason = refundReason;
        this.status = status;
        this.refundTransactionId = refundTransactionId;
        this.refundedAt = refundedAt;
        this.processedBy = processedBy;
        this.refundType = refundType;
        // Toss Payments 상세 정보
        this.cancelStatus = cancelStatus;
        this.cancelRequestId = cancelRequestId;
        this.taxFreeAmount = taxFreeAmount;
        this.taxExemptionAmount = taxExemptionAmount;
        this.refundableAmount = refundableAmount;
        this.cardDiscountAmount = cardDiscountAmount;
        this.transferDiscountAmount = transferDiscountAmount;
        this.easyPayDiscountAmount = easyPayDiscountAmount;
        this.receiptKey = receiptKey;
        this.totalAmount = totalAmount;
        this.balanceAmount = balanceAmount;
        this.paymentStatus = paymentStatus;
    }

    /**
     * 환불 상태 변경
     */
    public void updateStatus(RefundStatus status) {
        this.status = status;
    }

    /**
     * 환불 완료 처리 (Toss Payments 응답 기반)
     */
    public void completeRefund(String refundTransactionId, String cancelStatus, 
                               BigDecimal balanceAmount, String paymentStatus) {
        this.status = RefundStatus.COMPLETED;
        this.refundTransactionId = refundTransactionId;
        this.refundedAt = LocalDateTime.now();
        this.cancelStatus = cancelStatus;
        this.balanceAmount = balanceAmount;
        this.paymentStatus = paymentStatus;
    }

    /**
     * 환불 실패 처리
     */
    public void failRefund(String failureReason) {
        this.status = RefundStatus.FAILED;
        this.failureReason = failureReason;
    }
    
    /**
     * Toss Payments 환불 상세 정보 업데이트
     */
    public void updateTossPaymentDetails(String cancelStatus, String cancelRequestId,
                                         BigDecimal taxFreeAmount, BigDecimal taxExemptionAmount,
                                         BigDecimal refundableAmount, BigDecimal cardDiscountAmount,
                                         BigDecimal transferDiscountAmount, BigDecimal easyPayDiscountAmount,
                                         String receiptKey, BigDecimal totalAmount,
                                         BigDecimal balanceAmount, String paymentStatus) {
        this.cancelStatus = cancelStatus;
        this.cancelRequestId = cancelRequestId;
        this.taxFreeAmount = taxFreeAmount;
        this.taxExemptionAmount = taxExemptionAmount;
        this.refundableAmount = refundableAmount;
        this.cardDiscountAmount = cardDiscountAmount;
        this.transferDiscountAmount = transferDiscountAmount;
        this.easyPayDiscountAmount = easyPayDiscountAmount;
        this.receiptKey = receiptKey;
        this.totalAmount = totalAmount;
        this.balanceAmount = balanceAmount;
        this.paymentStatus = paymentStatus;
    }
}
