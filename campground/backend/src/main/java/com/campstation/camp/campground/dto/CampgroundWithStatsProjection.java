package com.campstation.camp.campground.dto;

/**
 * Campground with statistics projection (N+1 query prevention)
 */
public interface CampgroundWithStatsProjection {
    Long getCampgroundId();
    Double getAverageRating();
    Long getReviewCount();
    Long getFavoriteCount();
}
