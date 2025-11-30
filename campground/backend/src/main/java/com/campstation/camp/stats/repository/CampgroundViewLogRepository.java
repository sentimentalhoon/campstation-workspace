package com.campstation.camp.stats.repository;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.campstation.camp.stats.domain.CampgroundViewLog;

/**
 * 캠핑장 조회 로그 Repository
 */
@Repository
public interface CampgroundViewLogRepository extends JpaRepository<CampgroundViewLog, Long> {

    /**
     * 중복 방문 체크 (24시간 내)
     */
    @Query("SELECT v FROM CampgroundViewLog v " +
           "WHERE v.sessionId = :sessionId " +
           "AND v.campground.id = :campgroundId " +
           "AND v.viewedAt > :since " +
           "ORDER BY v.viewedAt DESC")
    Optional<CampgroundViewLog> findRecentView(
        @Param("sessionId") String sessionId,
        @Param("campgroundId") Long campgroundId,
        @Param("since") LocalDateTime since
    );

    /**
     * 최근 24시간 내 고유 방문자 수 조회
     */
    @Query("SELECT COUNT(DISTINCT v.sessionId) " +
           "FROM CampgroundViewLog v " +
           "WHERE v.campground.id = :campgroundId " +
           "AND v.viewedAt >= :since")
    Long countUniqueVisitorsLast24Hours(
        @Param("campgroundId") Long campgroundId,
        @Param("since") LocalDateTime since
    );

    /**
     * 90일 이상 오래된 로그 삭제
     */
    @Modifying
    @Query("DELETE FROM CampgroundViewLog v WHERE v.viewedAt < :before")
    void deleteOldLogs(@Param("before") LocalDateTime before);
}
