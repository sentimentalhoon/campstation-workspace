package com.campstation.camp.reservation.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RefundRequest {

    @NotNull(message = "결제 ID는 필수입니다")
    private Long paymentId;

    @NotNull(message = "환불 금액은 필수입니다")
    private BigDecimal refundAmount;

    @NotNull(message = "환불 사유는 필수입니다")
    @Size(max = 500, message = "환불 사유는 500자를 초과할 수 없습니다")
    private String refundReason;
}