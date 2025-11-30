package com.campstation.camp.shared;

import java.util.concurrent.atomic.AtomicBoolean;

import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import com.campstation.camp.shared.notification.AlertPublisher;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 데이터베이스 연결 헬스 체크
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseHealthIndicator implements HealthIndicator {

    private final JdbcTemplate jdbcTemplate;
    private final AlertPublisher alertPublisher;

    // 연속 실패 카운트 추적
    private final AtomicBoolean lastHealthStatus = new AtomicBoolean(true);
    private final AtomicBoolean alertSent = new AtomicBoolean(false);

    @Override
    public Health health() {
        try {
            // 간단한 쿼리로 데이터베이스 연결 확인
            jdbcTemplate.queryForObject("SELECT 1", Integer.class);

            // 이전에 실패 상태였다면 복구 알림
            if (!lastHealthStatus.getAndSet(true) && alertSent.getAndSet(false)) {
                log.info("Database connection restored");
                alertPublisher.publishHealthAlert("Database", "Connection restored");
            }

            return Health.up()
                    .withDetail("database", "PostgreSQL")
                    .withDetail("status", "Connected")
                    .build();

        } catch (Exception e) {
            log.error("Database health check failed: {}", e.getMessage());

            // 상태가 변경되었고 아직 알림을 보내지 않았다면 알림 발송
            if (lastHealthStatus.getAndSet(false) && !alertSent.getAndSet(true)) {
                alertPublisher.publishHealthAlert("Database", e.getMessage());
            }

            return Health.down()
                    .withDetail("database", "Connection failed")
                    .withDetail("error", e.getMessage())
                    .build();
        }
    }
}