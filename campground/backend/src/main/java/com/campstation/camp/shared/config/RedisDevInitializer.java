package com.campstation.camp.shared.config;

import java.util.logging.Logger;

import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.core.RedisCallback;
import org.springframework.data.redis.core.RedisTemplate;

import lombok.RequiredArgsConstructor;

/**
 * 개발 환경에서 Redis 캐시를 초기화하는 컴포넌트
 */
@Configuration
@RequiredArgsConstructor
public class RedisDevInitializer {

    private static final Logger logger = Logger.getLogger(RedisDevInitializer.class.getName());

    private final RedisTemplate<String, Object> redisTemplate;

    @Bean
    @SuppressWarnings("deprecation")
    public ApplicationRunner redisFlushRunner() {
        return args -> {
            try {
                logger.info("Initializing Redis cache in the development environment. 개발 환경에서 Redis 캐시를 초기화합니다...");
                redisTemplate.execute((RedisCallback<Object>) connection -> {
                    connection.flushAll();
                    return null;
                });
                logger.info("Redis cache initialization completed. Redis 캐시 초기화가 완료되었습니다.");
            } catch (Exception e) {
                logger.warning("An error occurred during Redis cache initialization: Redis 캐시 초기화 중 오류가 발생했습니다: " + e.getMessage());
            }
        };
    }
}