package com.campstation.camp.banner.dto;

import java.time.LocalDateTime;

import com.campstation.camp.banner.domain.Banner;
import com.campstation.camp.banner.domain.BannerStatus;
import com.campstation.camp.banner.domain.BannerType;
import com.campstation.camp.shared.dto.ImagePairDto;

/**
 * 배너 응답 DTO
 * Java 21 record를 활용한 불변 데이터 전송 객체
 */
public record BannerResponse(
    Long id,
    String title,
    String description,
    BannerType type,
    ImagePairDto image,
    String linkUrl,
    String linkTarget,
    Integer displayOrder,
    BannerStatus status,
    LocalDateTime startDate,
    LocalDateTime endDate,
    Long viewCount,
    Long clickCount,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
    /**
     * Banner 엔티티로부터 BannerResponse 생성
     */
    public static BannerResponse from(Banner banner) {
        return new BannerResponse(
            banner.getId(),
            banner.getTitle(),
            banner.getDescription(),
            banner.getType(),
            ImagePairDto.builder()
                .originalUrl(banner.getImageUrl())
                .thumbnailUrl(banner.getThumbnailUrl())
                .build(),
            banner.getLinkUrl(),
            banner.getLinkTarget(),
            banner.getDisplayOrder(),
            banner.getStatus(),
            banner.getStartDate(),
            banner.getEndDate(),
            banner.getViewCount(),
            banner.getClickCount(),
            banner.getCreatedAt(),
            banner.getUpdatedAt()
        );
    }
}
