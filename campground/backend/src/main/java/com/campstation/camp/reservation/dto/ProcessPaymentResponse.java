package com.campstation.camp.reservation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProcessPaymentResponse {
    private boolean success;
    private String transactionId;
    private String message;
}