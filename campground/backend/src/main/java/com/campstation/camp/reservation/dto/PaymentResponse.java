package com.campstation.camp.reservation.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.campstation.camp.reservation.domain.Payment;
import com.campstation.camp.reservation.domain.PaymentMethod;
import com.campstation.camp.reservation.domain.PaymentStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {
    private Long id;
    private Long reservationId;
    private BigDecimal amount;
    private PaymentMethod paymentMethod;
    private PaymentStatus status;
    private String transactionId;
    private String cardNumber; // 마스킹된 카드 번호
    private String cardHolderName;
    private String depositorName; // 무통장 입금 시 입금자명
    private String campgroundName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // 토스페이먼츠 상세 정보
    private String tossMethod; // 토스페이먼츠 결제 방법
    private String easyPayProvider; // 간편결제 제공자
    private String cardCompany; // 카드사
    private String cardType; // 카드 종류
    private String acquirerCode; // 매입사 코드
    private String installmentPlanMonths; // 할부 개월 수
    private String approveNo; // 승인 번호
    private String approvedAt; // 승인 일시

    public static PaymentResponse fromEntity(Payment payment) {
        return PaymentResponse.builder()
                .id(payment.getId())
                .reservationId(payment.getReservationId())
                .amount(payment.getAmount())
                .paymentMethod(payment.getPaymentMethod())
                .status(payment.getStatus())
                .transactionId(payment.getTransactionId())
                .cardNumber(payment.getCardNumber())
                .cardHolderName(payment.getCardHolderName())
                .depositorName(payment.getDepositorName())
                .createdAt(payment.getCreatedAt())
                .updatedAt(payment.getUpdatedAt())
                .tossMethod(payment.getTossMethod())
                .easyPayProvider(payment.getEasyPayProvider())
                .cardCompany(payment.getCardCompany())
                .cardType(payment.getCardType())
                .acquirerCode(payment.getAcquirerCode())
                .installmentPlanMonths(payment.getInstallmentPlanMonths())
                .approveNo(payment.getApproveNo())
                .approvedAt(payment.getApprovedAt())
                .build();
    }
}