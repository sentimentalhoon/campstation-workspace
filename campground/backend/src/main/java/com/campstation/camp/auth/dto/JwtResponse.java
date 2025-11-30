package com.campstation.camp.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * JWT 토큰 응답 DTO
 * 
 * @author CampStation Development Team
 * @version 2.0
 * @since 2025-11-03
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "JWT 인증 응답")
public class JwtResponse {

    @Schema(
            description = "JWT Access Token",
            example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            requiredMode = Schema.RequiredMode.REQUIRED
    )
    private String accessToken;

    @Builder.Default
    @Schema(
            description = "토큰 타입",
            example = "Bearer",
            requiredMode = Schema.RequiredMode.REQUIRED,
            defaultValue = "Bearer"
    )
    private String tokenType = "Bearer";

    @Schema(
            description = "토큰 만료 시간 (초)",
            example = "7200",
            requiredMode = Schema.RequiredMode.REQUIRED
    )
    private Long expiresIn;

    @Schema(
            description = "토큰 만료 시각 (Unix timestamp, milliseconds)",
            example = "1699612800000",
            requiredMode = Schema.RequiredMode.REQUIRED
    )
    private Long expiresAt;
    
    // 사용자 정보
    @Schema(
            description = "사용자 ID",
            example = "1",
            requiredMode = Schema.RequiredMode.REQUIRED
    )
    private Long userId;

    @Schema(
            description = "사용자 이메일",
            example = "user@campstation.com",
            requiredMode = Schema.RequiredMode.REQUIRED
    )
    private String email;

    @Schema(
            description = "사용자 이름",
            example = "홍길동",
            requiredMode = Schema.RequiredMode.REQUIRED
    )
    private String name;

    @Schema(
            description = "사용자 역할",
            example = "USER",
            allowableValues = {"USER", "OWNER", "ADMIN"},
            requiredMode = Schema.RequiredMode.REQUIRED
    )
    private String role;

    @Schema(
            description = "프로필 이미지 URL (썸네일)",
            example = "https://campstation.s3.amazonaws.com/profiles/thumbnail/user123.jpg",
            requiredMode = Schema.RequiredMode.NOT_REQUIRED
    )
    private String profileImage;

    @Schema(
            description = "프로필 썸네일 이미지 URL",
            example = "https://campstation.s3.amazonaws.com/profiles/thumbnail/user123.jpg",
            requiredMode = Schema.RequiredMode.NOT_REQUIRED
    )
    private String thumbnailUrl;

    @Schema(
            description = "프로필 원본 이미지 URL",
            example = "https://campstation.s3.amazonaws.com/profiles/original/user123.jpg",
            requiredMode = Schema.RequiredMode.NOT_REQUIRED
    )
    private String originalUrl;

    public JwtResponse(String accessToken, Long expiresIn,
                      Long userId, String email, String name, String role, String profileImage) {
        this.accessToken = accessToken;
        this.tokenType = "Bearer";
        this.expiresIn = expiresIn;
        // expiresAt 계산: 현재 시간 + expiresIn (초 → 밀리초)
        this.expiresAt = System.currentTimeMillis() + (expiresIn * 1000);
        this.userId = userId;
        this.email = email;
        this.name = name;
        this.role = role;
        this.profileImage = profileImage;
    }
}