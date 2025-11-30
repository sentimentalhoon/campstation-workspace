package com.campstation.camp.stats.dto;

import java.math.BigDecimal;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 캠핑장 통계 응답 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CampgroundStatsResponse {

    private Long campgroundId;

    /**
     * 총 방문자 수 (기간 내)
     */
    private Integer totalVisitors;

    /**
     * 총 조회수 (기간 내)
     */
    private Integer totalViews;

    /**
     * 일평균 방문자 수
     */
    private Double avgDailyVisitors;

    /**
     * 평균 체류 시간 (초)
     */
    private Integer avgViewDuration;

    /**
     * 예약 전환율 (%)
     */
    private BigDecimal conversionRate;

    /**
     * 일별 통계 목록
     */
    private List<DailyStats> dailyStats;
}
