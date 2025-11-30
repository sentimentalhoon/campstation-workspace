package com.campstation.camp.campground.dto;

import com.campstation.camp.campground.domain.SiteAmenity;

import jakarta.validation.constraints.NotNull;

public record SiteAmenityRequestDto(
    @NotNull(message = "편의시설 타입은 필수입니다.")
    SiteAmenity.AmenityType amenityType,

    @NotNull(message = "이용 가능 여부는 필수입니다.")
    Boolean available
) {}