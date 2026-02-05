package com.campstation.camp.shared.config;

import java.util.concurrent.TimeUnit;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import com.github.benmanes.caffeine.cache.Caffeine;

/**
 * 캐시 설정
 * Caffeine 로컬 캐시를 사용하여 성능 최적화
 */
@Configuration
@EnableCaching
public class CacheConfig {

    /**
     * Caffeine 캐시 매니저 설정 (Primary)
     * 
     * 캐시 저장소:
     * - averageRatings: 평균 평점 캐시 (10분) - 리뷰 평점 집계
     * - reviewCounts: 리뷰 수 캐시 (10분) - 리뷰 개수 집계
     * - dashboardStats: 대시보드 통계 캐시 (1분) - 관리자 대시보드
     * - ownerDashboardStats: Owner 대시보드 통계 캐시 (1분) - 오너 대시보드
     * - reviewStats: 리뷰 통계 캐시 (5분) - 리뷰 통계 정보
     * - campgroundImages: 캠핑장 이미지 캐시 (30분) - 이미지 목록, 메인 이미지
     * - userFavorites: 사용자 즐겨찾기 캐시 (5분) - 즐겨찾기 목록
     * - users: 사용자 캐시 (10분) - 사용자 정보
     * 
     * 성능 최적화:
     * - N+1 쿼리 방지를 위한 이미지 조회 캐싱
     * - 통계 정보는 짧은 TTL로 실시간성 유지
     */
    @Bean
    @Primary
    public CacheManager cacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager();

        // 배너 목록 캐시 (10분) - 자주 조회되지만 변경은 적음
        cacheManager.registerCustomCache("activeBanners",
                Caffeine.newBuilder()
                        .initialCapacity(10)
                        .maximumSize(100)
                        .expireAfterWrite(10, TimeUnit.MINUTES)
                        .recordStats()
                        .build());

        // 평균 평점 캐시 (10분)
        cacheManager.registerCustomCache("averageRatings",
                Caffeine.newBuilder()
                        .initialCapacity(100)
                        .maximumSize(1000)
                        .expireAfterWrite(10, TimeUnit.MINUTES)
                        .recordStats()
                        .build());

        // 리뷰 수 캐시 (10분)
        cacheManager.registerCustomCache("reviewCounts",
                Caffeine.newBuilder()
                        .initialCapacity(100)
                        .maximumSize(1000)
                        .expireAfterWrite(10, TimeUnit.MINUTES)
                        .recordStats()
                        .build());

        // 대시보드 통계 캐시 (1분) - Admin Dashboard
        cacheManager.registerCustomCache("dashboardStats",
                Caffeine.newBuilder()
                        .initialCapacity(10)
                        .maximumSize(100)
                        .expireAfterWrite(1, TimeUnit.MINUTES)
                        .recordStats()
                        .build());

        // Owner 대시보드 통계 캐시 (1분)
        cacheManager.registerCustomCache("ownerDashboardStats",
                Caffeine.newBuilder()
                        .initialCapacity(10)
                        .maximumSize(100)
                        .expireAfterWrite(1, TimeUnit.MINUTES)
                        .recordStats()
                        .build());

        // 리뷰 통계 캐시 (5분) - L1 캐시
        cacheManager.registerCustomCache("reviewStats",
                Caffeine.newBuilder()
                        .initialCapacity(50)
                        .maximumSize(500)
                        .expireAfterWrite(5, TimeUnit.MINUTES)
                        .recordStats()
                        .build());

        // 캠핑장 이미지 캐시 (30분) - 이미지는 자주 변경되지 않음
        cacheManager.registerCustomCache("campgroundImages",
                Caffeine.newBuilder()
                        .initialCapacity(100)
                        .maximumSize(1000)
                        .expireAfterWrite(30, TimeUnit.MINUTES)
                        .recordStats()
                        .build());

        // 사용자 즐겨찾기 캐시 (5분)
        cacheManager.registerCustomCache("userFavorites",
                Caffeine.newBuilder()
                        .initialCapacity(50)
                        .maximumSize(500)
                        .expireAfterWrite(5, TimeUnit.MINUTES)
                        .recordStats()
                        .build());

        // 사용자 캐시 (10분)
        cacheManager.registerCustomCache("users",
                Caffeine.newBuilder()
                        .initialCapacity(100)
                        .maximumSize(1000)
                        .expireAfterWrite(10, TimeUnit.MINUTES)
                        .recordStats()
                        .build());

        return cacheManager;
    }
}
