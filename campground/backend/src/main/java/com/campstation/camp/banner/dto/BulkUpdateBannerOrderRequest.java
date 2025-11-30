package com.campstation.camp.banner.dto;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 배너 순서 일괄 변경 요청 DTO
 * 여러 배너의 순서를 한 번에 변경
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BulkUpdateBannerOrderRequest {

    @NotEmpty(message = "변경할 배너 목록은 필수입니다")
    @Valid
    private List<BannerOrderItem> orders;

    /**
     * 개별 배너 순서 정보
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BannerOrderItem {

        @jakarta.validation.constraints.NotNull(message = "배너 ID는 필수입니다")
        private Long bannerId;

        @jakarta.validation.constraints.NotNull(message = "변경할 순서는 필수입니다")
        private Integer displayOrder;
    }
}
