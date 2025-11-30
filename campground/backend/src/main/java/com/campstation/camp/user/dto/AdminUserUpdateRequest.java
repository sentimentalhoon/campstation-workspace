package com.campstation.camp.user.dto;

import com.campstation.camp.user.domain.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 관리자용 사용자 업데이트 요청 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminUserUpdateRequest {

    @Size(min = 2, max = 50, message = "이름은 2-50자 사이여야 합니다")
    private String name;

    @Pattern(regexp = "^[0-9-]+$", message = "전화번호는 숫자와 하이픈만 입력 가능합니다")
    @Size(max = 20, message = "전화번호는 20자를 초과할 수 없습니다")
    private String phone;

    private UserRole role;

    @Email(message = "올바른 이메일 형식이 아닙니다")
    @Size(max = 100, message = "이메일은 100자를 초과할 수 없습니다")
    private String email;
}