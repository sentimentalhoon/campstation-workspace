package com.campstation.camp.campground.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.campstation.camp.campground.domain.Campground;
import com.campstation.camp.campground.domain.CampgroundCertification;
import com.campstation.camp.campground.domain.CampgroundOperationType;
import com.campstation.camp.campground.domain.CampgroundStatus;
import com.campstation.camp.shared.file.S3FileService;
import com.campstation.camp.user.dto.UserResponseDto;
import com.campstation.camp.user.repository.ProfileImageRepository;

/**
 * 캠핑장 응답 DTO
 * 캠핑장 정보를 클라이언트에 전달하기 위한 데이터 전송 객체
 *
 * @author CampStation Team
 * @version 1.0
 * @since 2024-01-01
 */
public record CampgroundResponse(
    Long id,
    String name,
    String description,
    String address,
    String phone,
    String email,
    String website,
    String imageUrl,
    List<String> thumbnailUrls,
    List<String> originalImageUrls,
    BigDecimal latitude,
    BigDecimal longitude,
    CampgroundStatus status,
    CampgroundOperationType operationType,
    CampgroundCertification certification,
    BigDecimal rating,
    Integer reviewCount,
    Integer favoriteCount,
    String checkInTime,
    String checkOutTime,
    String businessOwnerName,
    String businessName,
    String businessAddress,
    String businessEmail,
    String businessRegistrationNumber,
    String tourismBusinessNumber,
    UserResponseDto owner,
    LocalDateTime createdAt,
    LocalDateTime updatedAt,
    List<String> amenities  // 캠핑장의 모든 사이트에서 수집한 편의시설 목록
) {
    public static CampgroundResponse fromEntity(Campground campground, List<String> thumbNailList, List<String> originalImageUrls, BigDecimal rating, Integer reviewCount, Integer favoriteCount, S3FileService s3FileService, ProfileImageRepository profileImageRepository) {
        return new CampgroundResponse(
            campground.getId(),
            campground.getName(),
            campground.getDescription(),
            campground.getAddress(),
            campground.getPhone(),
            campground.getEmail(),
            campground.getWebsite(),
            campground.getMainImageUrl(),
            thumbNailList,
            originalImageUrls,
            campground.getLatitude(),
            campground.getLongitude(),
            campground.getStatus(),
            campground.getOperationType(),
            campground.getCertification(),
            rating,
            reviewCount,
            favoriteCount,
            campground.getCheckInTime() != null ? campground.getCheckInTime().toString() : null,
            campground.getCheckOutTime() != null ? campground.getCheckOutTime().toString() : null,
            campground.getBusinessOwnerName(),
            campground.getBusinessName(),
            campground.getBusinessAddress(),
            campground.getBusinessEmail(),
            campground.getBusinessRegistrationNumber(),
            campground.getTourismBusinessNumber(),
            UserResponseDto.fromEntity(campground.getOwner(), s3FileService, profileImageRepository),
            campground.getCreatedAt(),
            campground.getUpdatedAt(),
            List.of()  // amenities는 별도로 설정 필요
        );
    }

    /**
     * imageUrl을 Public URL로 받는 fromEntity 오버로딩 메서드
     */
    public static CampgroundResponse fromEntity(Campground campground, String publicImageUrl, List<String> thumbNailList, List<String> originalImageUrls, BigDecimal rating, Integer reviewCount, Integer favoriteCount, S3FileService s3FileService, ProfileImageRepository profileImageRepository) {
        return new CampgroundResponse(
            campground.getId(),
            campground.getName(),
            campground.getDescription(),
            campground.getAddress(),
            campground.getPhone(),
            campground.getEmail(),
            campground.getWebsite(),
            publicImageUrl,  // Public URL 사용
            thumbNailList,
            originalImageUrls,
            campground.getLatitude(),
            campground.getLongitude(),
            campground.getStatus(),
            campground.getOperationType(),
            campground.getCertification(),
            rating,
            reviewCount,
            favoriteCount,
            campground.getCheckInTime() != null ? campground.getCheckInTime().toString() : null,
            campground.getCheckOutTime() != null ? campground.getCheckOutTime().toString() : null,
            campground.getBusinessOwnerName(),
            campground.getBusinessName(),
            campground.getBusinessAddress(),
            campground.getBusinessEmail(),
            campground.getBusinessRegistrationNumber(),
            campground.getTourismBusinessNumber(),
            UserResponseDto.fromEntity(campground.getOwner(), s3FileService, profileImageRepository),
            campground.getCreatedAt(),
            campground.getUpdatedAt(),
            List.of()  // amenities는 별도로 설정 필요
        );
    }
}