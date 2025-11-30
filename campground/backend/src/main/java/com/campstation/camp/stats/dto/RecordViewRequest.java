package com.campstation.camp.stats.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 조회 기록 요청 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecordViewRequest {

    @NotBlank(message = "세션 ID는 필수입니다")
    private String sessionId;

    private String referrer;
}
