package com.campstation.camp.reservation.domain;

public enum PaymentMethod {
    CARD("신용카드"),
    EASY_PAYMENT("간편결제"),
    BANK_TRANSFER("계좌이체");

    private final String description;

    PaymentMethod(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}