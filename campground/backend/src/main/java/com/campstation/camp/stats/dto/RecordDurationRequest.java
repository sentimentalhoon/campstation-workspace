package com.campstation.camp.stats.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 체류 시간 기록 요청 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecordDurationRequest {

    @NotBlank(message = "세션 ID는 필수입니다")
    private String sessionId;

    @NotNull(message = "체류 시간은 필수입니다")
    @Min(value = 0, message = "체류 시간은 0 이상이어야 합니다")
    private Integer duration;
}
