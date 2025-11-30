package com.campstation.camp.stats.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.campstation.camp.stats.domain.CampgroundStatsDaily;

/**
 * 캠핑장 통계 Repository
 */
@Repository
public interface CampgroundStatsDailyRepository extends JpaRepository<CampgroundStatsDaily, Long> {

    /**
     * 특정 캠핑장의 특정 날짜 통계 조회
     */
    Optional<CampgroundStatsDaily> findByCampgroundIdAndStatDate(Long campgroundId, LocalDate statDate);

    /**
     * 특정 캠핑장의 날짜 범위별 통계 조회
     */
    @Query("SELECT s FROM CampgroundStatsDaily s " +
           "WHERE s.campground.id = :campgroundId " +
           "AND s.statDate BETWEEN :startDate AND :endDate " +
           "ORDER BY s.statDate DESC")
    List<CampgroundStatsDaily> findByCampgroundAndDateRange(
        @Param("campgroundId") Long campgroundId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );

    /**
     * 특정 캠핑장의 최근 N일 통계 조회
     */
    @Query("SELECT s FROM CampgroundStatsDaily s " +
           "WHERE s.campground.id = :campgroundId " +
           "AND s.statDate >= :startDate " +
           "ORDER BY s.statDate DESC")
    List<CampgroundStatsDaily> findRecentStats(
        @Param("campgroundId") Long campgroundId,
        @Param("startDate") LocalDate startDate
    );
}
