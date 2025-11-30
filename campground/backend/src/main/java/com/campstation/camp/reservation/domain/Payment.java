package com.campstation.camp.reservation.domain;

import java.math.BigDecimal;

import com.campstation.camp.shared.domain.BaseEntity;
import com.campstation.camp.shared.security.Ownable;
import com.campstation.camp.user.domain.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/**
 * 결제 엔티티
 * 예약 결제 정보를 저장하는 데이터베이스 엔티티
 * Ownable 인터페이스를 구현하여 소유자(결제자) 기반 권한 체크 지원
 *
 * @author CampStation Team
 * @version 2.0
 * @since 2024-01-01
 */
@Entity
@Table(name = "payments")
public class Payment extends BaseEntity implements Ownable {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "user_id", insertable = false, updatable = false)
    private Long userId;

    @Column(nullable = false)
    private Long reservationId;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod;

    @Column(nullable = false, length = 30)
    @Enumerated(EnumType.STRING)
    private PaymentStatus status;

    @Column(length = 100)
    private String transactionId;

    @Column(length = 500)
    private String cardNumber; // 마스킹된 카드 번호

    @Column(length = 50)
    private String cardHolderName;

    @Column(length = 100)
    private String depositorName; // 무통장 입금 시 입금자명

    @Column(length = 1000)
    private String failureReason;

    // 토스페이먼츠 상세 정보
    @Column(length = 50)
    private String tossMethod; // 토스페이먼츠 결제 방법 ("카드", "가상계좌", "간편결제" 등)
    
    @Column(length = 50)
    private String easyPayProvider; // 간편결제 제공자 ("카카오페이", "네이버페이", "토스페이" 등)
    
    @Column(length = 100)
    private String cardCompany; // 카드사 (예: "신한", "KB국민", "삼성" 등)
    
    @Column(length = 20)
    private String cardType; // 카드 종류 ("신용", "체크", "기프트" 등)
    
    @Column(length = 50)
    private String acquirerCode; // 매입사 코드
    
    @Column(length = 10)
    private String installmentPlanMonths; // 할부 개월 수 (0이면 일시불)
    
    @Column(length = 100)
    private String approveNo; // 승인 번호
    
    @Column(length = 30)
    private String approvedAt; // 승인 일시 (ISO 8601 형식)

    // Constructors
    protected Payment() {
    }

    public Payment(Long userId, Long reservationId, BigDecimal amount, PaymentMethod paymentMethod,
                   PaymentStatus status, String transactionId, String cardNumber, String cardHolderName) {
        this.userId = userId;
        this.reservationId = reservationId;
        this.amount = amount;
        this.paymentMethod = paymentMethod;
        this.status = status;
        this.transactionId = transactionId;
        this.cardNumber = cardNumber;
        this.cardHolderName = cardHolderName;
    }

    public void updateStatus(PaymentStatus status) {
        this.status = status;
    }

    public void updateTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }

    public void markAsFailed(String reason) {
        this.status = PaymentStatus.FAILED;
        this.failureReason = reason;
    }

    public void markAsCompleted(String transactionId) {
        this.status = PaymentStatus.COMPLETED;
        this.transactionId = transactionId;
    }

    /**
     * Ownable 인터페이스 구현: 결제자(소유자) 반환
     * 
     * @return 결제자 (User 엔티티)
     */
    @Override
    public User getOwner() {
        return this.user;
    }

    // Getters and Setters
    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
        this.userId = user != null ? user.getId() : null;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getReservationId() {
        return reservationId;
    }

    public void setReservationId(Long reservationId) {
        this.reservationId = reservationId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public PaymentMethod getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(PaymentMethod paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public PaymentStatus getStatus() {
        return status;
    }

    public void setStatus(PaymentStatus status) {
        this.status = status;
    }

    public String getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }

    public String getCardNumber() {
        return cardNumber;
    }

    public void setCardNumber(String cardNumber) {
        this.cardNumber = cardNumber;
    }

    public String getCardHolderName() {
        return cardHolderName;
    }

    public void setCardHolderName(String cardHolderName) {
        this.cardHolderName = cardHolderName;
    }

    public String getDepositorName() {
        return depositorName;
    }

    public void setDepositorName(String depositorName) {
        this.depositorName = depositorName;
    }

    public String getFailureReason() {
        return failureReason;
    }

    public void setFailureReason(String failureReason) {
        this.failureReason = failureReason;
    }

    public String getTossMethod() {
        return tossMethod;
    }

    public void setTossMethod(String tossMethod) {
        this.tossMethod = tossMethod;
    }

    public String getEasyPayProvider() {
        return easyPayProvider;
    }

    public void setEasyPayProvider(String easyPayProvider) {
        this.easyPayProvider = easyPayProvider;
    }

    public String getCardCompany() {
        return cardCompany;
    }

    public void setCardCompany(String cardCompany) {
        this.cardCompany = cardCompany;
    }

    public String getCardType() {
        return cardType;
    }

    public void setCardType(String cardType) {
        this.cardType = cardType;
    }

    public String getAcquirerCode() {
        return acquirerCode;
    }

    public void setAcquirerCode(String acquirerCode) {
        this.acquirerCode = acquirerCode;
    }

    public String getInstallmentPlanMonths() {
        return installmentPlanMonths;
    }

    public void setInstallmentPlanMonths(String installmentPlanMonths) {
        this.installmentPlanMonths = installmentPlanMonths;
    }

    public String getApproveNo() {
        return approveNo;
    }

    public void setApproveNo(String approveNo) {
        this.approveNo = approveNo;
    }

    public String getApprovedAt() {
        return approvedAt;
    }

    public void setApprovedAt(String approvedAt) {
        this.approvedAt = approvedAt;
    }

    // Builder pattern
    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private User user;
        private Long userId;
        private Long reservationId;
        private BigDecimal amount;
        private PaymentMethod paymentMethod;
        private PaymentStatus status;
        private String transactionId;
        private String cardNumber;
        private String cardHolderName;
        private String depositorName;
        private String failureReason;
        private String tossMethod;
        private String easyPayProvider;
        private String cardCompany;
        private String cardType;
        private String acquirerCode;
        private String installmentPlanMonths;
        private String approveNo;
        private String approvedAt;

        public Builder user(User user) {
            this.user = user;
            this.userId = user != null ? user.getId() : null;
            return this;
        }

        public Builder userId(Long userId) {
            this.userId = userId;
            return this;
        }

        public Builder reservationId(Long reservationId) {
            this.reservationId = reservationId;
            return this;
        }

        public Builder amount(BigDecimal amount) {
            this.amount = amount;
            return this;
        }

        public Builder paymentMethod(PaymentMethod paymentMethod) {
            this.paymentMethod = paymentMethod;
            return this;
        }

        public Builder status(PaymentStatus status) {
            this.status = status;
            return this;
        }

        public Builder transactionId(String transactionId) {
            this.transactionId = transactionId;
            return this;
        }

        public Builder cardNumber(String cardNumber) {
            this.cardNumber = cardNumber;
            return this;
        }

        public Builder cardHolderName(String cardHolderName) {
            this.cardHolderName = cardHolderName;
            return this;
        }

        public Builder depositorName(String depositorName) {
            this.depositorName = depositorName;
            return this;
        }

        public Builder failureReason(String failureReason) {
            this.failureReason = failureReason;
            return this;
        }

        public Builder tossMethod(String tossMethod) {
            this.tossMethod = tossMethod;
            return this;
        }

        public Builder easyPayProvider(String easyPayProvider) {
            this.easyPayProvider = easyPayProvider;
            return this;
        }

        public Builder cardCompany(String cardCompany) {
            this.cardCompany = cardCompany;
            return this;
        }

        public Builder cardType(String cardType) {
            this.cardType = cardType;
            return this;
        }

        public Builder acquirerCode(String acquirerCode) {
            this.acquirerCode = acquirerCode;
            return this;
        }

        public Builder installmentPlanMonths(String installmentPlanMonths) {
            this.installmentPlanMonths = installmentPlanMonths;
            return this;
        }

        public Builder approveNo(String approveNo) {
            this.approveNo = approveNo;
            return this;
        }

        public Builder approvedAt(String approvedAt) {
            this.approvedAt = approvedAt;
            return this;
        }

        public Payment build() {
            Payment payment = new Payment();
            payment.setUser(user);
            payment.setUserId(userId);
            payment.setReservationId(reservationId);
            payment.setAmount(amount);
            payment.setPaymentMethod(paymentMethod);
            payment.setStatus(status);
            payment.setTransactionId(transactionId);
            payment.setCardNumber(cardNumber);
            payment.setCardHolderName(cardHolderName);
            payment.setDepositorName(depositorName);
            payment.setFailureReason(failureReason);
            payment.setTossMethod(tossMethod);
            payment.setEasyPayProvider(easyPayProvider);
            payment.setCardCompany(cardCompany);
            payment.setCardType(cardType);
            payment.setAcquirerCode(acquirerCode);
            payment.setInstallmentPlanMonths(installmentPlanMonths);
            payment.setApproveNo(approveNo);
            payment.setApprovedAt(approvedAt);
            return payment;
        }
    }
}