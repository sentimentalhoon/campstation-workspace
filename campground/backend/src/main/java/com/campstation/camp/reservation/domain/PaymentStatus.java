package com.campstation.camp.reservation.domain;

public enum PaymentStatus {
    PENDING("결제 대기"),
    CONFIRMATION_REQUESTED("입금 확인 요청됨"),
    COMPLETED("결제 완료"),
    FAILED("결제 실패"),
    REFUND_PENDING("환불 대기중"),
    REFUNDED("환불 완료"),
    CANCELLED("결제 취소");

    private final String description;

    PaymentStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}