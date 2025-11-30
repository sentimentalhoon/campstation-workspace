package com.campstation.camp.banner.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 배너 순서 변경 요청 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateBannerOrderRequest {
    
    @NotNull(message = "변경할 순서는 필수입니다")
    private Integer displayOrder;
}
