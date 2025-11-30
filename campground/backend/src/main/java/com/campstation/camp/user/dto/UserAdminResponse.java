package com.campstation.camp.user.dto;

import java.time.LocalDateTime;

import com.campstation.camp.user.domain.User;
import com.campstation.camp.user.domain.UserRole;
import com.campstation.camp.user.domain.UserStatus;

/**
 * 관리자 화면에서 사용하는 사용자 요약 정보 DTO.
 */
public record UserAdminResponse(
        Long id,
        String username,
        String email,
        String name,
        String phone,
        UserRole role,
        UserStatus status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static UserAdminResponse from(User user) {
        return new UserAdminResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getName(),
                user.getPhone(),
                user.getRole(),
                user.getStatus(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }
}
