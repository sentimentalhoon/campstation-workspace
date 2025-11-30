package com.campstation.camp.auth.service;

import java.time.Duration;
import java.util.Optional;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import lombok.extern.slf4j.Slf4j;

/**
 * CampStation JWT 토큰 관리 서비스
 *
 * Redis를 활용하여 JWT 토큰의 저장, 조회, 삭제 기능을 제공합니다.
 * Redis가 사용 불가능한 경우에도 애플리케이션이 정상 동작하도록 설계되었습니다.
 *
 * 주요 기능:
 * - JWT 토큰의 Redis 저장 및 조회
 * - 토큰 블랙리스트 관리
 * - Redis 장애 시 폴백 모드 지원
 *
 * @author CampStation Development Team
 * @version 1.0
 * @since 2025-01-01
 */
@Service
@Slf4j
// @ConditionalOnProperty(name = "spring.cache.type", havingValue = "redis")
public class JwtTokenService {
    private final RedisTemplate<String, Object> redisTemplate;

    /**
     * JwtTokenService 생성자
     *
     * RedisTemplate이 주입되지 않은 경우에도 서비스가 정상 동작할 수 있도록
     * Optional을 사용하여 안전하게 처리합니다.
     *
     * @param redisTemplate Redis 템플릿 (선택적)
     */
    public JwtTokenService(Optional<RedisTemplate<String, Object>> redisTemplate) {
        this.redisTemplate = redisTemplate.orElse(null);
        if (this.redisTemplate == null) {
            log.info("Redis is not available, JwtTokenService will work in fallback mode");
        }
    }

    /**
     * JWT 토큰을 Redis에 저장합니다.
     *
     * 지정된 키로 JWT 토큰을 Redis에 저장하며, 만료 시간을 설정합니다.
     * Redis 저장 실패 시에도 애플리케이션은 계속 동작합니다.
     *
     * @param key 저장할 키 (예: username, userId 등)
     * @param token 저장할 JWT 토큰
     * @param expirationMillis 만료 시간 (밀리초 단위)
     */
    public void saveToken(String key, String token, long expirationMillis) {
        if (redisTemplate != null) {
            try {
                redisTemplate.opsForValue().set(key, token, Duration.ofMillis(expirationMillis));
                log.debug("Token saved to Redis successfully for key: {}", key);
            } catch (Exception e) {
                log.warn("Failed to save token to Redis for key {}: {}", key, e.getMessage());
                // Redis 오류가 발생해도 애플리케이션은 계속 진행
            }
        } else {
            log.debug("Redis is not available, skipping token save for key: {}", key);
        }
    }

    /**
     * Redis에서 JWT 토큰을 조회합니다.
     *
     * 지정된 키로 저장된 JWT 토큰을 조회합니다.
     *
     * @param key 조회할 키
     * @return 저장된 JWT 토큰, 없으면 null
     */
    public String getToken(String key) {
        if (redisTemplate != null) {
            try {
                Object value = redisTemplate.opsForValue().get(key);
                return value != null ? value.toString() : null;
            } catch (Exception e) {
                log.warn("Failed to get token from Redis: {}", e.getMessage());
            }
        } else {
            log.debug("Redis is not available, returning null for token");
        }
        return null;
    }

    /**
     * Redis에서 JWT 토큰을 삭제합니다.
     * @param key 삭제할 키
     */
    public void deleteToken(String key) {
        if (redisTemplate != null) {
            try {
                redisTemplate.delete(key);
            } catch (Exception e) {
                log.warn("Failed to delete token from Redis: {}", e.getMessage());
            }
        } else {
            log.debug("Redis is not available, skipping token delete");
        }
    }

    /**
     * JWT 블랙리스트(무효화) 토큰을 Redis에 저장합니다.
     * @param token 무효화할 토큰
     * @param expirationMillis 만료 시간 (ms)
     */
    public void blacklistToken(String token, long expirationMillis) {
        if (redisTemplate != null) {
            try {
                String key = "blacklist:" + token;
                redisTemplate.opsForValue().set(key, "blacklisted", Duration.ofMillis(expirationMillis));
                log.info("Token blacklisted successfully: {}", key);
            } catch (Exception e) {
                log.warn("Failed to blacklist token in Redis: {}", e.getMessage());
            }
        } else {
            log.debug("Redis is not available, skipping token blacklist");
        }
    }

    /**
     * 토큰이 블랙리스트에 있는지 확인합니다.
     * @param token 확인할 토큰
     * @return 블랙리스트 여부
     */
    public boolean isTokenBlacklisted(String token) {
        if (redisTemplate != null) {
            try {
                return redisTemplate.hasKey("blacklist:" + token);
            } catch (Exception e) {
                log.warn("Failed to check blacklist in Redis: {}", e.getMessage());
            }
        } else {
            log.debug("Redis is not available, token not blacklisted");
        }
        return false;
    }

    /**
     * 실시간 토큰 유효성 검증 (Redis 저장 + 블랙리스트 체크)
     * @param username 사용자명
     * @param token 토큰
     * @return 유효하면 true, 아니면 false
     */
    public boolean isTokenValid(String username, String token) {
        if (redisTemplate == null) {
            // Redis가 없을 때는 블랙리스트 체크만 생략하고 토큰이 null이 아니면 유효한 것으로 처리
            log.debug("Redis is not available, skipping token validation");
            return token != null;
        }
        
        try {
            String redisToken = getToken(username);
            if (token == null || isTokenBlacklisted(token)) return false;
            return token.equals(redisToken);
        } catch (Exception e) {
            log.warn("Failed to validate token in Redis: {}", e.getMessage());
            // Redis 연결 실패 시 토큰이 null이 아니면 유효한 것으로 처리
            return token != null;
        }
    }
}
