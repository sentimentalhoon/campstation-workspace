package com.campstation.camp.stats.scheduler;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.campstation.camp.stats.repository.CampgroundViewLogRepository;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 캠핑장 통계 배치 작업 스케줄러
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class StatsScheduler {

    private final EntityManager entityManager;
    private final CampgroundViewLogRepository viewLogRepository;

    /**
     * 일별 통계 집계
     * 실행 시간: 매일 자정 (KST)
     * 전날 데이터를 집계하여 campground_stats_daily에 저장
     */
    @Scheduled(cron = "0 0 0 * * *", zone = "Asia/Seoul")
    @Transactional
    public void aggregateDailyStats() {
        log.info("일별 통계 집계 시작");

        try {
            // 전날 날짜
            LocalDate targetDate = LocalDate.now().minusDays(1);

            // PostgreSQL 함수 호출
            entityManager.createNativeQuery("SELECT aggregate_daily_stats(:targetDate)")
                    .setParameter("targetDate", targetDate)
                    .getSingleResult();

            log.info("일별 통계 집계 완료: targetDate={}", targetDate);
        } catch (Exception e) {
            log.error("일별 통계 집계 실패", e);
        }
    }

    /**
     * 오래된 로그 정리
     * 실행 시간: 매주 일요일 자정 (KST)
     * 90일 이상 오래된 조회 로그 삭제
     */
    @Scheduled(cron = "0 0 0 * * SUN", zone = "Asia/Seoul")
    @Transactional
    public void cleanupOldLogs() {
        log.info("오래된 로그 정리 시작");

        try {
            // 90일 이전 데이터 삭제
            LocalDateTime before = LocalDateTime.now().minusDays(90);
            viewLogRepository.deleteOldLogs(before);

            log.info("오래된 로그 정리 완료: before={}", before);
        } catch (Exception e) {
            log.error("오래된 로그 정리 실패", e);
        }
    }
}
