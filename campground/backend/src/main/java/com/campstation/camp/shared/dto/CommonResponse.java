package com.campstation.camp.shared.dto;

/**
 * 공통 API 응답 래퍼 (Java 21 Record 사용)
  * 모든 API 응답을 일관된 구조로 감싸기 위해 사용
    * @param <T> 실제 응답 데이터 타입
 */
public record CommonResponse<T>(
        boolean success,
        String message,
        T data,
        String timestamp
) {
    public static <T> CommonResponse<T> success(T data) {
        return new CommonResponse<>(true, "요청이 성공적으로 처리되었습니다.", data, java.time.LocalDateTime.now().toString());
    }

    public static <T> CommonResponse<T> success(String message, T data) {
        return new CommonResponse<>(true, message, data, java.time.LocalDateTime.now().toString());
    }

    public static <T> CommonResponse<T> error(String message) {
        return new CommonResponse<>(false, message, null, java.time.LocalDateTime.now().toString());
    }

    public static <T> CommonResponse<T> error(String message, T data) {
        return new CommonResponse<>(false, message, data, java.time.LocalDateTime.now().toString());
    }
}