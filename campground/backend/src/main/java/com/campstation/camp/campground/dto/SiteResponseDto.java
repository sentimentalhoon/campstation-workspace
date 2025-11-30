package com.campstation.camp.campground.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

import com.campstation.camp.campground.domain.AmenityType;
import com.campstation.camp.campground.domain.Site;
import com.campstation.camp.campground.domain.SiteStatus;
import com.campstation.camp.campground.domain.SiteType;

/**
 * 사이트 응답 DTO
 * Bitmask 방식으로 편의시설 관리 (amenities는 AmenityType enum 이름 리스트로 반환)
 */
public record SiteResponseDto(
    Long id,
    String siteNumber,
    SiteType siteType,
    Integer capacity,
    String description,
    BigDecimal latitude,
    BigDecimal longitude,
    SiteStatus status,
    Long campgroundId,
    /**
     * 편의시설 목록 (AmenityType enum 이름들)
     * 예: ["ELECTRICITY", "WATER", "WIFI"]
     */
    List<String> amenities,
    /**
     * 기본 가격 (활성화된 요금제 중 우선순위가 가장 높은 요금제의 basePrice)
     * 요금제가 없으면 null
     */
    BigDecimal basePrice,
    /**
     * 썸네일 이미지 URL 목록
     */
    List<String> thumbnailUrls,
    /**
     * 원본 이미지 URL 목록
     */
    List<String> originalImageUrls,
    /**
     * 이미지 ID 목록 (삭제 시 사용)
     */
    List<Long> imageIds
) {
    /**
     * Service 레이어에서 모든 데이터를 직접 추출하여 DTO 생성
     * Entity의 lazy collection에 절대 접근하지 않음
     */
    public static SiteResponseDto of(
            Site site,
            BigDecimal basePrice,
            List<String> thumbnailUrls,
            List<String> originalImageUrls,
            List<Long> imageIds
    ) {
        return new SiteResponseDto(
            site.getId(),
            site.getSiteNumber(),
            site.getSiteType(),
            site.getCapacity(),
            site.getDescription(),
            site.getLatitude(),
            site.getLongitude(),
            site.getStatus(),
            site.getCampgroundId(),
            site.getAmenities().stream()
                .map(AmenityType::name)
                .collect(Collectors.toList()),
            basePrice,
            thumbnailUrls,
            originalImageUrls,
            imageIds
        );
    }
}
