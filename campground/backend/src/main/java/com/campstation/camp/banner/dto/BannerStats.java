package com.campstation.camp.banner.dto;

/**
 * 배너 통계 DTO
 */
public record BannerStats(
    long activeBanners,
    long totalViews,
    long totalClicks,
    double averageCtr
) {
    /**
     * CTR(Click-Through Rate) 계산
     */
    public static BannerStats of(long activeBanners, long totalViews, long totalClicks) {
        double averageCtr = totalViews > 0 
            ? (double) totalClicks / totalViews * 100 
            : 0.0;
        
        return new BannerStats(activeBanners, totalViews, totalClicks, averageCtr);
    }
}
