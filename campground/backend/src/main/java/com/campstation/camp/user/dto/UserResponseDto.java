package com.campstation.camp.user.dto;

import java.time.LocalDateTime;

import com.campstation.camp.shared.file.S3FileService;
import com.campstation.camp.user.domain.ProfileImage;
import com.campstation.camp.user.domain.User;
import com.campstation.camp.user.domain.UserRole;
import com.campstation.camp.user.domain.UserStatus;
import com.campstation.camp.user.repository.ProfileImageRepository;
import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.extern.slf4j.Slf4j;

/**
 * 사용자 응답 DTO
 */
@Slf4j
@JsonInclude(JsonInclude.Include.NON_NULL) // null 필드는 JSON 응답에서 제외
public record UserResponseDto(
    Long id,
    String email,
    String name,
    String phone,
    UserRole role,
    UserStatus status,
    LocalDateTime createdAt,
    LocalDateTime updatedAt,
    String thumbnailUrl,
    String originalUrl,
    String provider,
    String refundBankName,
    String refundAccountNumber,
    String refundAccountHolder
) {
    /**
     * User 엔티티 → UserResponseDto 변환
     * @deprecated ProfileImage 정보 없이 변환하므로 fromEntity(User, S3FileService, ProfileImageRepository) 사용 권장
     */
    @Deprecated
    public static UserResponseDto fromEntity(User user) {
        if (user == null) {
            return null;
        }
        return new UserResponseDto(
            user.getId(),
            user.getEmail(),
            user.getName(),
            user.getPhone(),
            user.getRole(),
            user.getStatus(),
            user.getCreatedAt(),
            user.getUpdatedAt(),
            null, // thumbnailUrl
            null, // originalUrl
            user.getProvider(),
            user.getRefundBankName(),
            user.getRefundAccountNumber(),
            user.getRefundAccountHolder()
        );
    }

    /**
     * User 엔티티 → UserResponseDto 변환 (Public URL 포함)
     * ProfileImage 엔티티에서 썸네일/원본 이미지 경로를 조회하여 Public URL로 변환
     */
    public static UserResponseDto fromEntity(User user, S3FileService s3FileService) {
        if (user == null) {
            return null;
        }

        return new UserResponseDto(
            user.getId(),
            user.getEmail(),
            user.getName(),
            user.getPhone(),
            user.getRole(),
            user.getStatus(),
            user.getCreatedAt(),
            user.getUpdatedAt(),
            null, // thumbnailUrl - ProfileImageRepository 없이는 조회 불가
            null, // originalUrl - ProfileImageRepository 없이는 조회 불가
            user.getProvider(),
            user.getRefundBankName(),
            user.getRefundAccountNumber(),
            user.getRefundAccountHolder()
        );
    }

    /**
     * User 엔티티 → UserResponseDto 변환 (ProfileImage 포함)
     * ProfileImage 엔티티에서 썸네일/원본 이미지 경로를 조회하여 Public URL로 변환
     */
    public static UserResponseDto fromEntity(User user, S3FileService s3FileService, ProfileImageRepository profileImageRepository) {
        if (user == null) {
            return null;
        }

        String thumbnailUrl = null;
        String originalUrl = null;

        // ProfileImage 조회 및 Public URL 변환
        if (profileImageRepository != null) {
            ProfileImage profileImage = profileImageRepository.findByUserId(user.getId()).orElse(null);
            if (profileImage != null) {
                thumbnailUrl = s3FileService.generatePublicUrl(profileImage.getThumbnailUrl());
                originalUrl = s3FileService.generatePublicUrl(profileImage.getOriginalUrl());
            }
        }

        return new UserResponseDto(
            user.getId(),
            user.getEmail(),
            user.getName(),
            user.getPhone(),
            user.getRole(),
            user.getStatus(),
            user.getCreatedAt(),
            user.getUpdatedAt(),
            thumbnailUrl,
            originalUrl,
            user.getProvider(),
            user.getRefundBankName(),
            user.getRefundAccountNumber(),
            user.getRefundAccountHolder()
        );
    }
}
