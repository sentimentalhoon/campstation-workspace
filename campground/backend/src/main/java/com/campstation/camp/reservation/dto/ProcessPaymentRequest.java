package com.campstation.camp.reservation.dto;

import java.math.BigDecimal;

import com.campstation.camp.reservation.domain.PaymentMethod;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProcessPaymentRequest {
    private Long reservationId;
    private BigDecimal amount;
    private PaymentMethod paymentMethod;
    private PaymentInfo paymentInfo;

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaymentInfo {
        private String cardNumber;
        private String expiryDate;
        private String cvv;
        private String cardHolderName;
    }
}