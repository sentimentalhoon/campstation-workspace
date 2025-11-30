package com.campstation.camp.shared;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.Gauge;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * 애플리케이션 메트릭 수집 서비스
 * Micrometer를 활용한 성능 및 비즈니스 메트릭 모니터링
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class MetricsService {

    private final MeterRegistry meterRegistry;

    // 시스템 메트릭 게이지
    private final AtomicInteger activeUsers = new AtomicInteger(0);
    private final AtomicInteger activeBookings = new AtomicInteger(0);

    // 비즈니스 메트릭 카운터 (생성자에서 초기화)
    private Counter loginAttempts;
    private Counter loginSuccess;
    private Counter loginFailures;
    private Counter bookingCreated;
    private Counter bookingCancelled;
    private Counter paymentProcessed;
    private Counter paymentRefunded;

    @PostConstruct
    public void init() {
        // 게이지 등록
        Gauge.builder("campstation.users.active", activeUsers, AtomicInteger::get)
                .description("Number of currently active users")
                .register(meterRegistry);

        Gauge.builder("campstation.bookings.active", activeBookings, AtomicInteger::get)
                .description("Number of currently active bookings")
                .register(meterRegistry);

        // 카운터 초기화
        loginAttempts = Counter.builder("campstation.login.attempts")
                .description("Total number of login attempts")
                .register(meterRegistry);

        loginSuccess = Counter.builder("campstation.login.success")
                .description("Number of successful logins")
                .register(meterRegistry);

        loginFailures = Counter.builder("campstation.login.failures")
                .description("Number of failed logins")
                .register(meterRegistry);

        bookingCreated = Counter.builder("campstation.booking.created")
                .description("Number of bookings created")
                .register(meterRegistry);

        bookingCancelled = Counter.builder("campstation.booking.cancelled")
                .description("Number of bookings cancelled")
                .register(meterRegistry);

        paymentProcessed = Counter.builder("campstation.payment.processed")
                .description("Number of payments processed")
                .register(meterRegistry);

        paymentRefunded = Counter.builder("campstation.payment.refunded")
                .description("Number of payments refunded")
                .register(meterRegistry);

        // 캐시 메트릭 카운터 초기화
        Counter.builder("campstation.cache.hits")
                .description("Number of cache hits")
                .register(meterRegistry);

        Counter.builder("campstation.cache.misses")
                .description("Number of cache misses")
                .register(meterRegistry);
    }

    /**
     * 로그인 시도 기록
     */
    public void recordLoginAttempt() {
        loginAttempts.increment();
        log.debug("Login attempt recorded");
    }

    /**
     * 로그인 성공 기록
     */
    public void recordLoginSuccess() {
        loginSuccess.increment();
        activeUsers.incrementAndGet();
        log.debug("Login success recorded");
    }

    /**
     * 로그인 실패 기록
     */
    public void recordLoginFailure() {
        loginFailures.increment();
        log.debug("Login failure recorded");
    }

    /**
     * 로그아웃 기록
     */
    public void recordLogout() {
        activeUsers.decrementAndGet();
        log.debug("Logout recorded");
    }

    /**
     * 예약 생성 기록
     */
    public void recordBookingCreated() {
        bookingCreated.increment();
        activeBookings.incrementAndGet();
        log.debug("Booking created recorded");
    }

    /**
     * 예약 취소 기록
     */
    public void recordBookingCancelled() {
        bookingCancelled.increment();
        activeBookings.decrementAndGet();
        log.debug("Booking cancelled recorded");
    }

    /**
     * 결제 처리 기록
     */
    public void recordPaymentProcessed() {
        paymentProcessed.increment();
        log.debug("Payment processed recorded");
    }

    /**
     * 환불 처리 기록
     */
    public void recordPaymentRefunded() {
        paymentRefunded.increment();
        log.debug("Payment refunded recorded");
    }

    /**
     * API 응답 시간 기록
     */
    public Timer.Sample startApiTimer() {
        return Timer.start(meterRegistry);
    }

    /**
     * API 타이머 완료
     */
    public void stopApiTimer(Timer.Sample sample, String method, String endpoint) {
        sample.stop(Timer.builder("campstation.api.endpoint.response.time")
                .description("API endpoint response time")
                .tag("method", method)
                .tag("endpoint", endpoint)
                .register(meterRegistry));
    }

    /**
     * 커스텀 메트릭 기록
     */
    public void recordCustomMetric(String name, double value, String... tags) {
        if (tags.length % 2 != 0) {
            log.warn("Tags must be key-value pairs");
            return;
        }

        Counter.Builder builder = Counter.builder(name)
                .description("Custom metric: " + name);

        for (int i = 0; i < tags.length; i += 2) {
            builder.tag(tags[i], tags[i + 1]);
        }

        builder.register(meterRegistry).increment(value);
        log.debug("Custom metric recorded: {} = {}", name, value);
    }

    /**
     * API 응답 시간 기록
     */
    public void recordApiResponseTime(String endpoint, String method, long durationMs) {
        Timer.builder("campstation.api.response.time")
                .description("API response time in milliseconds")
                .tag("endpoint", endpoint)
                .tag("method", method)
                .register(meterRegistry)
                .record(durationMs, TimeUnit.MILLISECONDS);
    }

    /**
     * API 상태 코드별 카운트 기록
     */
    public void recordApiStatusCode(String endpoint, String method, int statusCode) {
        Counter.builder("campstation.api.status.code")
                .description("API status code counts")
                .tag("endpoint", endpoint)
                .tag("method", method)
                .tag("status", String.valueOf(statusCode))
                .tag("status_group", getStatusCodeGroup(statusCode))
                .register(meterRegistry)
                .increment();
    }

    /**
     * 상태 코드 그룹 분류 (2xx, 3xx, 4xx, 5xx)
     */
    private String getStatusCodeGroup(int statusCode) {
        if (statusCode >= 200 && statusCode < 300) {
            return "2xx";
        } else if (statusCode >= 300 && statusCode < 400) {
            return "3xx";
        } else if (statusCode >= 400 && statusCode < 500) {
            return "4xx";
        } else if (statusCode >= 500 && statusCode < 600) {
            return "5xx";
        } else {
            return "unknown";
        }
    }

    /**
     * 현재 활성 사용자 수 조회
     */
    public int getActiveUsers() {
        return activeUsers.get();
    }

    /**
     * 현재 활성 예약 수 조회
     */
    public int getActiveBookings() {
        return activeBookings.get();
    }

    /**
     * 캐시 히트 기록
     */
    public void recordCacheHit(String cacheName) {
        Counter.builder("campstation.cache.hits")
                .tag("cache", cacheName)
                .register(meterRegistry)
                .increment();
    }

    /**
     * 캐시 미스 기록
     */
    public void recordCacheMiss(String cacheName) {
        Counter.builder("campstation.cache.misses")
                .tag("cache", cacheName)
                .register(meterRegistry)
                .increment();
    }
}