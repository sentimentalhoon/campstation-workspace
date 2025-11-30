package com.campstation.camp.stats.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.campstation.camp.stats.domain.CampgroundStatsDaily;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 일별 통계 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DailyStats {

    private LocalDate date;
    private Integer uniqueVisitors;
    private Integer totalViews;
    private Integer loggedInVisitors;
    private Integer anonymousVisitors;
    private Integer avgViewDuration;
    private Integer reservationsCount;
    private BigDecimal conversionRate;

    /**
     * Entity에서 DTO로 변환
     */
    public static DailyStats from(CampgroundStatsDaily entity) {
        return DailyStats.builder()
                .date(entity.getStatDate())
                .uniqueVisitors(entity.getUniqueVisitors())
                .totalViews(entity.getTotalViews())
                .loggedInVisitors(entity.getLoggedInVisitors())
                .anonymousVisitors(entity.getAnonymousVisitors())
                .avgViewDuration(entity.getAvgViewDuration())
                .reservationsCount(entity.getReservationsCount())
                .conversionRate(entity.getConversionRate())
                .build();
    }
}
