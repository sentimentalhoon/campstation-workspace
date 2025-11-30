package com.campstation.camp.user.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 환불 계좌 정보 업데이트 요청 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RefundAccountUpdateRequest {

    @Size(max = 50, message = "은행명은 50자 이하여야 합니다")
    private String refundBankName;

    @Size(max = 50, message = "계좌번호는 50자 이하여야 합니다")
    private String refundAccountNumber;

    @Size(max = 50, message = "예금주명은 50자 이하여야 합니다")
    private String refundAccountHolder;
}
