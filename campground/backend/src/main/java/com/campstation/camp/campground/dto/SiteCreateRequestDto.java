package com.campstation.camp.campground.dto;

import java.util.List;

import com.campstation.camp.campground.domain.SiteType;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * 사이트 생성 요청 DTO
 * Bitmask 방식으로 편의시설 관리 (amenities는 AmenityType enum 이름들의 리스트)
 */
public record SiteCreateRequestDto(
    @NotNull(message = "캠핑장 ID는 필수입니다.")
    Long campgroundId,

    @NotBlank(message = "사이트 번호는 필수입니다.")
    @Size(max = 20, message = "사이트 번호는 20자를 초과할 수 없습니다.")
    String siteNumber,

    @NotNull(message = "사이트 타입은 필수입니다.")
    SiteType siteType,

    @NotNull(message = "수용 인원은 필수입니다.")
    @Min(value = 1, message = "수용 인원은 1명 이상이어야 합니다.")
    @Max(value = 20, message = "수용 인원은 20명을 초과할 수 없습니다.")
    Integer capacity,

    @Size(max = 1000, message = "설명은 1000자를 초과할 수 없습니다.")
    String description,

    /**
     * 편의시설 목록 (AmenityType enum 이름들)
     * 예: ["ELECTRICITY", "WATER", "WIFI"]
     */
    List<String> amenities
) {}
