package com.campstation.camp.shared;

import java.util.Date;
import java.util.function.Function;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;

/**
 * JWT 토큰 생성 및 검증을 위한 유틸리티 클래스
 */
@Component
@Slf4j
public class JwtUtil {

    @Value("${jwt.secret:}")
    private String secret;

    @Value("${jwt.expiration:86400000}") // 24시간 (밀리초)
    private Long expiration;

    @Value("${jwt.refresh-expiration:604800000}") // 7일 (밀리초)
    private Long refreshExpiration;

    private SecretKey signingKey;

    /**
     * SecretKey 생성 (HS512 알고리즘에 적합한 키 생성)
     */
    private SecretKey getSigningKey() {
        if (signingKey == null) {
            // 설정된 시크릿이 충분히 긴지 확인
            if (secret.getBytes().length >= 64) {
                signingKey = Keys.hmacShaKeyFor(secret.getBytes());
            } else {
                // 시크릿이 너무 짧으면 HS512에 적합한 키를 자동 생성
                log.warn("Configured JWT secret is too short for HS512. Generating a secure key.");
                signingKey = Jwts.SIG.HS512.key().build();
            }
        }
        return signingKey;
    }

    /**
     * JWT 토큰에서 사용자명 추출
     */
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * JWT 토큰에서 만료일 추출
     */
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    /**
     * JWT 토큰에서 특정 클레임 추출
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /**
     * JWT 토큰에서 모든 클레임 추출
     */
    private Claims extractAllClaims(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (JwtException e) {
            log.error("JWT token parsing failed: {}", e.getMessage());
            throw e;
        }
    }

    /**
     * JWT 토큰 만료 여부 확인
     */
    public Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    /**
     * Access Token 생성
     */
    public String generateAccessToken(UserDetails userDetails) {
        return createToken(userDetails.getUsername(), expiration);
    }

    /**
     * Refresh Token 생성
     */
    public String generateRefreshToken(UserDetails userDetails) {
        return createToken(userDetails.getUsername(), refreshExpiration);
    }

    /**
     * JWT 토큰 생성
     */
    private String createToken(String subject, Long expiration) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiration);

        return Jwts.builder()
                .subject(subject)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSigningKey())
                .compact();
    }

    /**
     * JWT 토큰 검증 (강화된 보안 검증)
     */
    public Boolean validateToken(String token, UserDetails userDetails) {
        try {
            final String username = extractUsername(token);

            // 1. 사용자명 일치 확인
            if (!username.equals(userDetails.getUsername())) {
                log.warn("Token username mismatch: expected={}, actual={}", userDetails.getUsername(), username);
                return false;
            }

            // 2. 토큰 만료 확인
            if (isTokenExpired(token)) {
                log.warn("Token expired for user: {}", username);
                return false;
            }

            // 3. 토큰 발급 시간 검증 (미래 발급 토큰 거부)
            Date issuedAt = extractClaim(token, Claims::getIssuedAt);
            if (issuedAt != null && issuedAt.after(new Date())) {
                log.warn("Token issued in future for user: {}", username);
                return false;
            }

            // 4. 토큰 서명 검증
            extractAllClaims(token); // 서명 검증 포함

            log.debug("Token validation successful for user: {}", username);
            return true;

        } catch (JwtException e) {
            log.error("JWT token validation failed for user {}: {}", userDetails.getUsername(), e.getMessage());
            return false;
        } catch (Exception e) {
            log.error("Unexpected error during token validation for user {}: {}", userDetails.getUsername(), e.getMessage());
            return false;
        }
    }

    /**
     * JWT 토큰이 유효한지 확인 (사용자 정보 없이)
     */
    public Boolean isTokenValid(String token) {
        try {
            extractAllClaims(token);
            return !isTokenExpired(token);
        } catch (JwtException e) {
            log.error("JWT token validation failed: {}", e.getMessage());
            return false;
        }
    }
}