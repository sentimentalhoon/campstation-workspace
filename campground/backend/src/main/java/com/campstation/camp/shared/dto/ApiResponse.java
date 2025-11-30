package com.campstation.camp.shared.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * API 공통 응답 DTO (OpenAPI Schema 적용)
 * 
 * 모든 API 응답에 사용되는 표준화된 응답 형식
 * 
 * @param <T> 응답 데이터 타입
 * @author CampStation Development Team
 * @version 2.0
 * @since 2025-11-03
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "API 공통 응답 형식")
public class ApiResponse<T> {

    @Schema(
            description = "요청 성공 여부",
            example = "true",
            requiredMode = Schema.RequiredMode.REQUIRED
    )
    private boolean success;

    @Schema(
            description = "응답 메시지",
            example = "성공적으로 처리되었습니다.",
            requiredMode = Schema.RequiredMode.REQUIRED
    )
    private String message;

    @Schema(
            description = "응답 데이터",
            requiredMode = Schema.RequiredMode.NOT_REQUIRED
    )
    private T data;

    @Schema(
            description = "타임스탬프 (ISO 8601 형식)",
            example = "2025-11-03T10:15:30Z",
            requiredMode = Schema.RequiredMode.REQUIRED
    )
    private String timestamp;

    /**
     * 성공 응답 생성 (데이터 포함)
     */
    public static <T> ApiResponse<T> success(String message, T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .data(data)
                .timestamp(java.time.Instant.now().toString())
                .build();
    }

    /**
     * 성공 응답 생성 (데이터 없음)
     */
    public static <T> ApiResponse<T> success(String message) {
        return success(message, null);
    }

    /**
     * 실패 응답 생성
     */
    public static <T> ApiResponse<T> error(String message) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .data(null)
                .timestamp(java.time.Instant.now().toString())
                .build();
    }

    /**
     * 실패 응답 생성 (데이터 포함)
     */
    public static <T> ApiResponse<T> error(String message, T data) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .data(data)
                .timestamp(java.time.Instant.now().toString())
                .build();
    }
}
