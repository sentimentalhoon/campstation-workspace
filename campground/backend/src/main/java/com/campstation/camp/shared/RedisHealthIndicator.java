package com.campstation.camp.shared;

import java.util.concurrent.atomic.AtomicBoolean;

import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import com.campstation.camp.shared.notification.AlertPublisher;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Redis 연결 헬스 체크
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class RedisHealthIndicator implements HealthIndicator {

    private final RedisTemplate<String, Object> redisTemplate;
    private final AlertPublisher alertPublisher;

    // 연속 실패 카운트 추적
    private final AtomicBoolean lastHealthStatus = new AtomicBoolean(true);
    private final AtomicBoolean alertSent = new AtomicBoolean(false);

    @Override
    public Health health() {
        try {
            // 간단한 Redis 작업으로 연결 확인
            redisTemplate.opsForValue().set("health-check", "ok");
            String result = (String) redisTemplate.opsForValue().get("health-check");
            redisTemplate.delete("health-check");

            if ("ok".equals(result)) {
                // 이전에 실패 상태였다면 복구 알림
                if (!lastHealthStatus.getAndSet(true) && alertSent.getAndSet(false)) {
                    log.info("Redis connection restored");
                    alertPublisher.publishHealthAlert("Redis", "Connection restored");
                }

                return Health.up()
                        .withDetail("redis", "Connected")
                        .withDetail("status", "Healthy")
                        .build();
            } else {
                // 상태가 변경되었고 아직 알림을 보내지 않았다면 알림 발송
                if (lastHealthStatus.getAndSet(false) && !alertSent.getAndSet(true)) {
                    alertPublisher.publishHealthAlert("Redis", "Operation failed - expected 'ok', got '" + result + "'");
                }

                return Health.down()
                        .withDetail("redis", "Operation failed")
                        .withDetail("expected", "ok")
                        .withDetail("actual", result)
                        .build();
            }

        } catch (Exception e) {
            log.error("Redis health check failed: {}", e.getMessage());

            // 상태가 변경되었고 아직 알림을 보내지 않았다면 알림 발송
            if (lastHealthStatus.getAndSet(false) && !alertSent.getAndSet(true)) {
                alertPublisher.publishHealthAlert("Redis", e.getMessage());
            }

            return Health.down()
                    .withDetail("redis", "Connection failed")
                    .withDetail("error", e.getMessage())
                    .build();
        }
    }
}
