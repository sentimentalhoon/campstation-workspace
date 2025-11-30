package com.campstation.camp.reservation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RefundResponse {

    private boolean success;
    private String message;
    private String refundTransactionId;
    private BigDecimal refundedAmount;
    private LocalDateTime refundedAt;
}