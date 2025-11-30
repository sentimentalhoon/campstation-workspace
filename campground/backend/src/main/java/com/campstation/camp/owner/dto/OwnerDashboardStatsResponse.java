package com.campstation.camp.owner.dto;

import lombok.Builder;

/**
 * Owner 대시보드 통계 응답 DTO (사이트 중심)
 * 한 명의 소유자가 보통 하나의 캠핑장을 운영하며, 여러 사이트를 관리하는 구조
 */
@Builder
public record OwnerDashboardStatsResponse(
    // 기본 정보
    Long myCampgrounds,          // 내 캠핑장 수
    Long totalSites,             // 총 사이트 수
    Long availableSites,         // 예약 가능한 사이트 수
    
    // 예약 통계
    Long totalReservations,      // 총 예약 수
    Long activeReservations,     // 진행 중인 예약 (CONFIRMED)
    Long upcomingCheckIns,       // 30일 내 체크인 예정
    
    // 수익 통계
    Long monthlyRevenue,         // 이번 달 수익
    Long totalRevenue,           // 총 수익
    Long averageRevenuePerSite,  // 사이트당 평균 수익
    
    // 사이트 성과 지표
    Double siteOccupancyRate,    // 전체 사이트 가동률 (%)
    Double averageStayLength,    // 평균 투숙 일수
    Long totalGuests,            // 총 투숙 인원
    
    // 리뷰 & 평점
    Long totalReviews,           // 총 리뷰 수
    Double averageRating,        // 평균 평점
    
    // 취소율
    Double cancellationRate      // 예약 취소율 (%)
) {}
