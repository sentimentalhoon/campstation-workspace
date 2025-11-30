package com.campstation.camp.shared.exception;

import java.time.Instant;
import java.util.List;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * API 에러 응답 DTO
 * 
 * 에러 발생 시 표준화된 에러 정보를 제공
 * 
 * @author CampStation Development Team
 * @version 2.0
 * @since 2025-11-03
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "API 에러 응답 형식")
public class ErrorResponse {

    @Schema(
            description = "요청 성공 여부 (항상 false)",
            example = "false",
            requiredMode = Schema.RequiredMode.REQUIRED
    )
    @Builder.Default
    private boolean success = false;

    @Schema(
            description = "에러 메시지",
            example = "요청 처리 중 오류가 발생했습니다.",
            requiredMode = Schema.RequiredMode.REQUIRED
    )
    private String message;

    @Schema(
            description = "에러 코드",
            example = "USER_NOT_FOUND",
            requiredMode = Schema.RequiredMode.NOT_REQUIRED
    )
    private String errorCode;

    @Schema(
            description = "HTTP 상태 코드",
            example = "404",
            requiredMode = Schema.RequiredMode.REQUIRED
    )
    private int status;

    @Schema(
            description = "요청 경로",
            example = "/api/v1/users/123",
            requiredMode = Schema.RequiredMode.NOT_REQUIRED
    )
    private String path;

    @Schema(
            description = "타임스탬프 (ISO 8601 형식)",
            example = "2025-11-03T10:15:30Z",
            requiredMode = Schema.RequiredMode.REQUIRED
    )
    @Builder.Default
    private String timestamp = Instant.now().toString();

    @Schema(
            description = "상세 에러 목록 (검증 실패 시)",
            requiredMode = Schema.RequiredMode.NOT_REQUIRED
    )
    private List<FieldError> errors;

    /**
     * 필드 에러 DTO
     */
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @Schema(description = "필드 검증 에러")
    public static class FieldError {

        @Schema(
                description = "필드 이름",
                example = "email",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        private String field;

        @Schema(
                description = "거부된 값",
                example = "invalid-email",
                requiredMode = Schema.RequiredMode.NOT_REQUIRED
        )
        private Object rejectedValue;

        @Schema(
                description = "에러 메시지",
                example = "이메일 형식이 올바르지 않습니다.",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        private String message;
    }

    /**
     * 에러 응답 생성 (기본)
     */
    public static ErrorResponse of(int status, String message) {
        return ErrorResponse.builder()
                .success(false)
                .status(status)
                .message(message)
                .build();
    }

    /**
     * 에러 응답 생성 (에러 코드 포함)
     */
    public static ErrorResponse of(int status, String message, String errorCode) {
        return ErrorResponse.builder()
                .success(false)
                .status(status)
                .message(message)
                .errorCode(errorCode)
                .build();
    }

    /**
     * 에러 응답 생성 (전체 정보 포함)
     */
    public static ErrorResponse of(int status, String message, String errorCode, String path) {
        return ErrorResponse.builder()
                .success(false)
                .status(status)
                .message(message)
                .errorCode(errorCode)
                .path(path)
                .build();
    }

    /**
     * 검증 에러 응답 생성
     */
    public static ErrorResponse validation(int status, String message, List<FieldError> errors) {
        return ErrorResponse.builder()
                .success(false)
                .status(status)
                .message(message)
                .errorCode("VALIDATION_ERROR")
                .errors(errors)
                .build();
    }
}
