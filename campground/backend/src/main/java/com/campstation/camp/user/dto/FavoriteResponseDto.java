package com.campstation.camp.user.dto;

import java.time.LocalDateTime;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * 찜하기 응답 DTO
 */
@Schema(description = "찜하기 정보")
public record FavoriteResponseDto(

    @Schema(description = "찜하기 ID", example = "1")
    Long id,

    @Schema(description = "캠핑장 ID", example = "1")
    Long campgroundId,

    @Schema(description = "캠핑장 이름", example = "서울숲 캠핑장")
    String campgroundName,

    @Schema(description = "캠핑장 주소", example = "서울시 성동구 서울숲길 1")
    String campgroundAddress,

    @Schema(description = "찜하기 생성일시", example = "2024-01-01T10:00:00")
    LocalDateTime createdAt

) {
}