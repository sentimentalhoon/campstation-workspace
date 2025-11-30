package com.campstation.camp.stats.domain;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import com.campstation.camp.campground.domain.Campground;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Index;
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 캠핑장 통계 요약 엔티티 (일별)
 * 목적: 일별 통계를 미리 집계하여 조회 성능 향상
 * 업데이트: 배치 작업 (매일 자정)
 */
@Entity
@Table(name = "campground_stats_daily",
    indexes = {
        @Index(name = "idx_stats_campground_date", columnList = "campground_id, stat_date"),
        @Index(name = "idx_stats_date", columnList = "stat_date")
    },
    uniqueConstraints = {
        @UniqueConstraint(name = "unique_campground_date", columnNames = {"campground_id", "stat_date"})
    }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class CampgroundStatsDaily {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "campground_id", nullable = false)
    private Campground campground;

    @Column(name = "stat_date", nullable = false)
    private LocalDate statDate;

    // 방문자 통계
    @Column(name = "unique_visitors", nullable = false)
    private Integer uniqueVisitors = 0;

    @Column(name = "total_views", nullable = false)
    private Integer totalViews = 0;

    @Column(name = "logged_in_visitors", nullable = false)
    private Integer loggedInVisitors = 0;

    @Column(name = "anonymous_visitors", nullable = false)
    private Integer anonymousVisitors = 0;

    // 행동 지표
    @Column(name = "avg_view_duration", nullable = false)
    private Integer avgViewDuration = 0;

    // 전환율 (Phase 2)
    @Column(name = "reservations_count", nullable = false)
    private Integer reservationsCount = 0;

    @Column(name = "conversion_rate", precision = 5, scale = 2, nullable = false)
    private BigDecimal conversionRate = BigDecimal.ZERO;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Builder
    public CampgroundStatsDaily(Campground campground, LocalDate statDate,
                                Integer uniqueVisitors, Integer totalViews,
                                Integer loggedInVisitors, Integer anonymousVisitors,
                                Integer avgViewDuration, Integer reservationsCount,
                                BigDecimal conversionRate) {
        this.campground = campground;
        this.statDate = statDate;
        this.uniqueVisitors = uniqueVisitors != null ? uniqueVisitors : 0;
        this.totalViews = totalViews != null ? totalViews : 0;
        this.loggedInVisitors = loggedInVisitors != null ? loggedInVisitors : 0;
        this.anonymousVisitors = anonymousVisitors != null ? anonymousVisitors : 0;
        this.avgViewDuration = avgViewDuration != null ? avgViewDuration : 0;
        this.reservationsCount = reservationsCount != null ? reservationsCount : 0;
        this.conversionRate = conversionRate != null ? conversionRate : BigDecimal.ZERO;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * 통계 업데이트
     */
    public void updateStats(Integer uniqueVisitors, Integer totalViews,
                           Integer loggedInVisitors, Integer anonymousVisitors,
                           Integer avgViewDuration, Integer reservationsCount,
                           BigDecimal conversionRate) {
        this.uniqueVisitors = uniqueVisitors != null ? uniqueVisitors : this.uniqueVisitors;
        this.totalViews = totalViews != null ? totalViews : this.totalViews;
        this.loggedInVisitors = loggedInVisitors != null ? loggedInVisitors : this.loggedInVisitors;
        this.anonymousVisitors = anonymousVisitors != null ? anonymousVisitors : this.anonymousVisitors;
        this.avgViewDuration = avgViewDuration != null ? avgViewDuration : this.avgViewDuration;
        this.reservationsCount = reservationsCount != null ? reservationsCount : this.reservationsCount;
        this.conversionRate = conversionRate != null ? conversionRate : this.conversionRate;
        this.updatedAt = LocalDateTime.now();
    }
}
