package com.campstation.camp.campground.dto;

import java.math.BigDecimal;
import java.util.List;

import com.campstation.camp.campground.domain.SiteType;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

/**
 * 사이트 수정 요청 DTO
 * Bitmask 방식으로 편의시설 관리
 */
public record SiteUpdateRequestDto(
    @Size(max = 20, message = "사이트 번호는 20자를 초과할 수 없습니다.")
    String siteNumber,

    SiteType siteType,

    @Min(value = 1, message = "수용 인원은 1명 이상이어야 합니다.")
    @Max(value = 20, message = "수용 인원은 20명을 초과할 수 없습니다.")
    Integer capacity,

    @Size(max = 1000, message = "설명은 1000자를 초과할 수 없습니다.")
    String description,

    @DecimalMin(value = "-90.0", message = "위도는 -90.0 이상이어야 합니다.")
    @DecimalMax(value = "90.0", message = "위도는 90.0 이하여야 합니다.")
    BigDecimal latitude,

    @DecimalMin(value = "-180.0", message = "경도는 -180.0 이상이어야 합니다.")
    @DecimalMax(value = "180.0", message = "경도는 180.0 이하여야 합니다.")
    BigDecimal longitude,

    /**
     * 편의시설 목록 (AmenityType enum 이름들)
     * 예: ["ELECTRICITY", "WATER", "WIFI"]
     */
    List<String> amenities,

    /**
     * 삭제할 이미지 ID 목록
     * 예: [1, 2, 3]
     */
    List<Long> deleteImageIds
) {}
