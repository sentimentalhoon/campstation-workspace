package com.campstation.camp.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 로그인 요청 DTO
 * 
 * @author CampStation Development Team
 * @version 2.0
 * @since 2025-11-03
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "로그인 요청")
public class LoginRequest {

    @NotBlank(message = "이메일을 입력해주세요.")
    @Email(message = "올바른 이메일 형식을 입력해주세요.")
    @Size(max = 100, message = "이메일은 100자 이하여야 합니다.")
    @Schema(
            description = "사용자 이메일 (로그인 ID)",
            example = "user@campstation.com",
            requiredMode = Schema.RequiredMode.REQUIRED,
            maxLength = 100
    )
    private String email;

    @NotBlank(message = "비밀번호를 입력해주세요.")
    @Size(min = 6, max = 100, message = "비밀번호는 6자 이상 100자 이하여야 합니다.")
    @Schema(
            description = "사용자 비밀번호 (6자 이상)",
            example = "password123!",
            requiredMode = Schema.RequiredMode.REQUIRED,
            minLength = 6,
            maxLength = 100,
            format = "password"
    )
    private String password;
}