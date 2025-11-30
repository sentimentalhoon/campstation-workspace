package com.campstation.camp.shared.ratelimit;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import lombok.extern.slf4j.Slf4j;

/**
 * Rate Limiting Configuration (Profile-based)
 *
 * Supports different rate limits per environment (dev vs prod):
 * - Dev: Generous limits for development convenience
 * - Prod: Stricter limits for security and resource protection
 *
 * Configuration via application-{profile}.yml
 */
@Slf4j
@Configuration
public class RateLimitConfig {

    private final Map<String, Bucket> cache = new ConcurrentHashMap<>();

    @Value("${rate-limit.auth.capacity:50}")
    private int authCapacity;

    @Value("${rate-limit.auth.duration-minutes:1}")
    private int authDurationMinutes;

    @Value("${rate-limit.payment.capacity:50}")
    private int paymentCapacity;

    @Value("${rate-limit.payment.duration-minutes:1}")
    private int paymentDurationMinutes;

    @Value("${rate-limit.api.capacity:300}")
    private int apiCapacity;

    @Value("${rate-limit.api.duration-minutes:1}")
    private int apiDurationMinutes;

    /**
     * Get bucket for authentication endpoints
     * Limit: Configurable per environment
     */
    public Bucket resolveAuthBucket(String key) {
        String bucketKey = "auth:" + key;
        return cache.computeIfAbsent(bucketKey, k -> createAuthBucket());
    }

    /**
     * Get bucket for payment endpoints
     * Limit: Configurable per environment
     */
    public Bucket resolvePaymentBucket(String key) {
        String bucketKey = "payment:" + key;
        return cache.computeIfAbsent(bucketKey, k -> createPaymentBucket());
    }

    /**
     * Get bucket for general API endpoints
     * Limit: Configurable per environment
     */
    public Bucket resolveApiBucket(String key) {
        String bucketKey = "api:" + key;
        return cache.computeIfAbsent(bucketKey, k -> createApiBucket());
    }

    private Bucket createAuthBucket() {
        Bandwidth limit = Bandwidth.builder()
                .capacity(authCapacity)
                .refillGreedy(authCapacity, Duration.ofMinutes(authDurationMinutes))
                .build();
        log.debug("Created auth bucket with capacity: {} per {} minute(s)", authCapacity, authDurationMinutes);
        return Bucket.builder()
                .addLimit(limit)
                .build();
    }

    private Bucket createPaymentBucket() {
        Bandwidth limit = Bandwidth.builder()
                .capacity(paymentCapacity)
                .refillGreedy(paymentCapacity, Duration.ofMinutes(paymentDurationMinutes))
                .build();
        log.debug("Created payment bucket with capacity: {} per {} minute(s)", paymentCapacity, paymentDurationMinutes);
        return Bucket.builder()
                .addLimit(limit)
                .build();
    }

    private Bucket createApiBucket() {
        Bandwidth limit = Bandwidth.builder()
                .capacity(apiCapacity)
                .refillGreedy(apiCapacity, Duration.ofMinutes(apiDurationMinutes))
                .build();
        log.debug("Created API bucket with capacity: {} per {} minute(s)", apiCapacity, apiDurationMinutes);
        return Bucket.builder()
                .addLimit(limit)
                .build();
    }

    /**
     * Clear all buckets (useful for testing or admin reset)
     */
    public void clearAll() {
        cache.clear();
        log.info("All rate limit buckets cleared");
    }
}
