package com.campstation.camp.user.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

/**
 * 찜하기 토글 요청 DTO
 */
@Schema(description = "찜하기 토글 요청")
public record FavoriteToggleRequest(

    @Schema(description = "캠핑장 ID", example = "1")
    @NotNull(message = "캠핑장 ID는 필수입니다")
    @Positive(message = "캠핑장 ID는 양수여야 합니다")
    Long campgroundId

) {
}