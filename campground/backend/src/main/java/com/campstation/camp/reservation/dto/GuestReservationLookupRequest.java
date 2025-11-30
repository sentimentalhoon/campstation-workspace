package com.campstation.camp.reservation.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 비회원 예약 조회 요청 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "비회원 예약 조회 요청")
public class GuestReservationLookupRequest {

    @NotBlank(message = "연락처는 필수입니다.")
    @Pattern(regexp = "^[0-9-+()\\s]{8,20}$", message = "올바른 연락처 형식이 아닙니다.")
    @Schema(description = "예약 시 입력한 연락처", example = "010-1234-5678")
    private String guestPhone;

    @NotBlank(message = "이메일은 필수입니다.")
    @Email(message = "올바른 이메일 형식이 아닙니다.")
    @Schema(description = "예약 시 입력한 이메일", example = "guest@example.com")
    private String guestEmail;

    @NotBlank(message = "예약자 확인용 비밀번호는 필수입니다.")
    @Schema(description = "예약 시 설정한 비밀번호", example = "1234")
    private String guestPassword;
}