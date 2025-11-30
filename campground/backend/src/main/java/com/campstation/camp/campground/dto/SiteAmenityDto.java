package com.campstation.camp.campground.dto;

import com.campstation.camp.campground.domain.SiteAmenity;

public record SiteAmenityDto(
    Long id,
    String name,
    boolean available
) {
    public static SiteAmenityDto from(SiteAmenity siteAmenity) {
        return new SiteAmenityDto(
            siteAmenity.getId(),
            siteAmenity.getAmenityType().name(),
            siteAmenity.getAvailable()
        );
    }
}
