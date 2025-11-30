package com.campstation.camp.payment.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 결제 로그 응답 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentLogResponse {
    private Long id;
    private Long userId;
    private Long reservationId;
    private Double amount;
    private String type;  // PAYMENT, REFUND
    private String status;  // SUCCESS, FAILED, PENDING
    private String method;  // CARD, TRANSFER, etc.
    private String userName;
    private String campgroundName;
    
    // Payment 테이블의 추가 필드들
    private String transactionId;
    private String cardNumber;
    private String cardHolderName;
    private String depositorName;
    private String failureReason;
    
    // 토스페이먼츠 상세 정보
    private String tossMethod;
    private String easyPayProvider;
    private String cardCompany;
    private String cardType;
    private String acquirerCode;
    private String installmentPlanMonths;
    private String approveNo;
    private String approvedAt;
    
    // 환불 시간 (REFUND 타입일 때 사용)
    private LocalDateTime refundedAt;
    
    // 타임스탬프
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
