package com.campstation.camp.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 관리자 대시보드 통계 응답 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardStatsResponse {
    private Long totalUsers;
    private Long totalCampgrounds;
    private Long totalReservations;
    private Long totalReviews;
    private Long pendingCampgrounds;
    private Long activeReservations;
    private Double monthlyRevenue;
    private Double averageRating;
    private Long todayCheckIns;
    private Long todayCheckOuts;
}
