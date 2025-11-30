package com.campstation.camp.banner.dto;

import com.campstation.camp.banner.domain.BannerStatus;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 배너 상태 변경 요청 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateBannerStatusRequest {
    
    @NotNull(message = "변경할 상태는 필수입니다")
    private BannerStatus status;
}
