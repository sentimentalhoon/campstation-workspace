package com.campstation.camp.reservation.dto;

import java.time.LocalDate;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Builder;

/**
 * 비회원 예약 요청 DTO - record 기반 불변 구조
 */
@Builder
@Schema(description = "비회원 예약 요청")
public record GuestReservationRequest(
        @NotNull(message = "캠핑장 ID는 필수입니다.")
        @Schema(description = "캠핑장 ID", example = "1")
        Long campgroundId,

        @NotNull(message = "사이트 ID는 필수입니다.")
        @Schema(description = "사이트 ID", example = "1")
        Long siteId,

        @NotNull(message = "체크인 날짜는 필수입니다.")
        @Future(message = "체크인 날짜는 현재 날짜 이후여야 합니다.")
        @Schema(description = "체크인 날짜", example = "2024-12-25")
        LocalDate checkInDate,

        @NotNull(message = "체크아웃 날짜는 필수입니다.")
        @Future(message = "체크아웃 날짜는 현재 날짜 이후여야 합니다.")
        @Schema(description = "체크아웃 날짜", example = "2024-12-27")
        LocalDate checkOutDate,

        @NotNull(message = "인원 수는 필수입니다.")
        @Min(value = 1, message = "인원 수는 1명 이상이어야 합니다.")
        @Max(value = 20, message = "인원 수는 20명 이하여야 합니다.")
        @Schema(description = "인원 수", example = "4")
        Integer numberOfGuests,

        @Schema(description = "특별 요청사항", example = "늦은 체크인 희망")
        String specialRequests,

        @NotBlank(message = "예약자 이름은 필수입니다.")
        @Size(min = 2, max = 50, message = "예약자 이름은 2-50자 사이여야 합니다.")
        @Schema(description = "예약자 이름", example = "홍길동")
        String guestName,

        @NotBlank(message = "연락처는 필수입니다.")
        @Pattern(regexp = "^[0-9-+()\\s]{8,20}$", message = "올바른 연락처 형식이 아닙니다.")
        @Schema(description = "연락처", example = "010-1234-5678")
        String guestPhone,

        @NotBlank(message = "이메일은 필수입니다.")
        @Email(message = "올바른 이메일 형식이 아닙니다.")
        @Schema(description = "이메일", example = "guest@example.com")
        String guestEmail,

        @NotBlank(message = "예약자 확인용 비밀번호는 필수입니다.")
        @Size(min = 4, max = 20, message = "비밀번호는 4-20자 사이여야 합니다.")
        @Schema(description = "예약 확인용 비밀번호", example = "1234")
        String guestPassword
) {
}