package com.campstation.camp.shared.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

import lombok.Getter;
import lombok.extern.slf4j.Slf4j;

/**
 * Cookie 설정 중앙 관리 클래스
 * 
 * JWT 토큰을 HttpOnly 쿠키로 설정할 때 필요한 속성들을 중앙에서 관리합니다.
 * 환경별로 다른 보안 설정(Secure, SameSite)을 자동으로 적용합니다.
 * 
 * @author CampStation Development Team
 * @version 1.0
 * @since 2025-11-04
 */
@Component
@Slf4j
@Getter
public class CookieConfig {

    @Value("${spring.profiles.active:dev}")
    private String activeProfile;

    @Value("${jwt.expiration:7200000}") // 기본값 2시간 (7200000ms)
    private long jwtExpirationMs;

    @Value("${jwt.refresh.expiration:2592000000}") // 기본값 30일 (2592000000ms)
    private long jwtRefreshExpirationMs;

    /**
     * 프로덕션 환경인지 확인
     */
    public boolean isProduction() {
        return "prod".equals(activeProfile) || "production".equals(activeProfile);
    }

    /**
     * Access Token 쿠키 생성
     * 
     * @param token JWT Access Token
     * @return ResponseCookie
     */
    public ResponseCookie createAccessTokenCookie(String token) {
        ResponseCookie.ResponseCookieBuilder builder = ResponseCookie.from("accessToken", token)
                .httpOnly(true)
                .path("/")
                .maxAge(jwtExpirationMs / 1000); // ms를 초로 변환

        if (isProduction()) {
            // 프로덕션: HTTPS + SameSite=None (CORS 허용)
            builder.secure(true).sameSite("None");
            log.debug("Creating access token cookie for PRODUCTION (Secure=true, SameSite=None)");
        } else {
            // 개발: HTTP + SameSite=Lax (로컬 테스트 편의)
            builder.secure(false).sameSite("Lax");
            log.debug("Creating access token cookie for DEVELOPMENT (Secure=false, SameSite=Lax)");
        }

        return builder.build();
    }

    /**
     * Refresh Token 쿠키 생성
     * 
     * @param token JWT Refresh Token
     * @return ResponseCookie
     */
    public ResponseCookie createRefreshTokenCookie(String token) {
        ResponseCookie.ResponseCookieBuilder builder = ResponseCookie.from("refreshToken", token)
                .httpOnly(true)
                .path("/")
                .maxAge(jwtRefreshExpirationMs / 1000); // ms를 초로 변환

        if (isProduction()) {
            // 프로덕션: HTTPS + SameSite=None
            builder.secure(true).sameSite("None");
            log.debug("Creating refresh token cookie for PRODUCTION (Secure=true, SameSite=None)");
        } else {
            // 개발: HTTP + SameSite=Lax
            builder.secure(false).sameSite("Lax");
            log.debug("Creating refresh token cookie for DEVELOPMENT (Secure=false, SameSite=Lax)");
        }

        return builder.build();
    }

    /**
     * Access Token 쿠키 삭제 (만료)
     * 
     * @return ResponseCookie
     */
    public ResponseCookie deleteAccessTokenCookie() {
        ResponseCookie.ResponseCookieBuilder builder = ResponseCookie.from("accessToken", "")
                .httpOnly(true)
                .path("/")
                .maxAge(0); // 즉시 만료

        if (isProduction()) {
            builder.secure(true).sameSite("None");
        } else {
            builder.secure(false).sameSite("Lax");
        }

        return builder.build();
    }

    /**
     * Refresh Token 쿠키 삭제 (만료)
     * 
     * @return ResponseCookie
     */
    public ResponseCookie deleteRefreshTokenCookie() {
        ResponseCookie.ResponseCookieBuilder builder = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .path("/")
                .maxAge(0); // 즉시 만료

        if (isProduction()) {
            builder.secure(true).sameSite("None");
        } else {
            builder.secure(false).sameSite("Lax");
        }

        return builder.build();
    }
}
