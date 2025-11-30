package com.campstation.camp.shared;

import java.io.IOException;
import java.util.Date;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import com.campstation.camp.auth.service.JwtTokenService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * JWT 인증 필터
 * 모든 HTTP 요청에서 JWT 토큰을 검증하고 인증 정보를 설정
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;
    private final JwtTokenService jwtTokenService;

    public JwtAuthenticationFilter(JwtUtil jwtUtil, UserDetailsService userDetailsService, JwtTokenService jwtTokenService) {
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
        this.jwtTokenService = jwtTokenService;
    }

    @Override
    protected void doFilterInternal(
            @org.springframework.lang.NonNull HttpServletRequest request,
            @org.springframework.lang.NonNull HttpServletResponse response,
            @org.springframework.lang.NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        try {
            String jwt = getJwtFromRequest(request);

            if (StringUtils.hasText(jwt)) {
                log.debug("JWT token found in request: {} from IP: {}", request.getRequestURI(), getClientIpAddress(request));

                // 1. 블랙리스트 토큰 검증
                if (isTokenBlacklisted(jwt)) {
                    log.warn("Blacklisted JWT token detected for request: {} from IP: {}", request.getRequestURI(), getClientIpAddress(request));
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    return;
                }

                // 2. 기본 토큰 유효성 검증
                if (jwtUtil.isTokenValid(jwt)) {
                    String username = jwtUtil.extractUsername(jwt);
                    log.debug("Token is valid, extracted username: {}", username);

                    // 3. 토큰 만료 시간 검증 (1분 이내 만료되는 토큰은 거부)
                    if (isTokenNearExpiration(jwt)) {
                        log.warn("Token near expiration rejected for user: {} from IP: {}", username, getClientIpAddress(request));
                        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                        response.getWriter().write("{\"error\":\"Token near expiration. Please refresh token.\"}");
                        return;
                    }

                    if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                        UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                        log.debug("UserDetails loaded for username: {}", username);

                        if (jwtUtil.validateToken(jwt, userDetails)) {
                            UsernamePasswordAuthenticationToken authentication =
                                    new UsernamePasswordAuthenticationToken(
                                            userDetails,
                                            null,
                                            userDetails.getAuthorities()
                                    );
                            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                            SecurityContextHolder.getContext().setAuthentication(authentication);

                            log.info("User '{}' authenticated successfully from IP: {}", username, getClientIpAddress(request));
                        } else {
                            log.warn("Token validation failed for user: {} from IP: {}", username, getClientIpAddress(request));
                        }
                    } else {
                        log.debug("Username is null or authentication already exists for: {}", username);
                    }
                } else {
                    log.warn("Invalid JWT token for request: {} from IP: {}", request.getRequestURI(), getClientIpAddress(request));
                }
            }
        } catch (Exception e) {
            log.error("Cannot set user authentication: {} from IP: {}", e.getMessage(), getClientIpAddress(request), e);
        }

        filterChain.doFilter(request, response);
    }

    /**
     * HTTP 요청에서 JWT 토큰 추출
     * 1. Authorization 헤더 (Bearer 토큰) - 우선순위 1
     * 2. HttpOnly 쿠키 (accessToken) - 우선순위 2
     */
    private String getJwtFromRequest(HttpServletRequest request) {
        // 1. Authorization 헤더에서 토큰 추출 (우선순위 높음)
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            String token = bearerToken.substring(7).trim();
            // JWT 형식 검증: 최소한 2개의 점(.)이 있어야 함
            if (StringUtils.hasText(token) && token.split("\\.").length == 3) {
                log.debug("JWT token found in Authorization header");
                return token;
            } else {
                log.debug("Invalid JWT format in Authorization header: token has {} parts",
                    token.isEmpty() ? 0 : token.split("\\.").length);
            }
        }

        // 2. HttpOnly 쿠키에서 Access Token 추출 (우선순위 낮음)
        jakarta.servlet.http.Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (jakarta.servlet.http.Cookie cookie : cookies) {
                if ("accessToken".equals(cookie.getName())) {
                    String token = cookie.getValue();
                    // JWT 형식 검증: 최소한 2개의 점(.)이 있어야 함
                    if (StringUtils.hasText(token) && token.split("\\.").length == 3) {
                        log.debug("JWT token found in Cookie");
                        return token;
                    } else {
                        log.debug("Invalid JWT format in cookie: token has {} parts",
                            token == null || token.isEmpty() ? 0 : token.split("\\.").length);
                    }
                }
            }
        }

        log.debug("No valid JWT token found in request");
        return null;
    }

    /**
     * 클라이언트 IP 주소 추출 (프록시 고려)
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (StringUtils.hasText(xForwardedFor)) {
            return xForwardedFor.split(",")[0].trim();
        }

        String xRealIp = request.getHeader("X-Real-IP");
        if (StringUtils.hasText(xRealIp)) {
            return xRealIp;
        }

        return request.getRemoteAddr();
    }

    /**
     * 토큰이 블랙리스트에 있는지 확인
     */
    private boolean isTokenBlacklisted(String token) {
        if (jwtTokenService == null) {
            // Redis가 비활성화된 경우 블랙리스트 검사 생략
            return false;
        }
        String key = "blacklist:" + token;
        String blacklisted = jwtTokenService.getToken(key);
        boolean isBlacklisted = blacklisted != null;
        if (isBlacklisted) {
            log.warn("Token is blacklisted: {}", key);
        }
        return isBlacklisted;
    }

    /**
     * 토큰이 만료 예정인지 확인 (1분 이내)
     */
    private boolean isTokenNearExpiration(String token) {
        try {
            Date expiration = jwtUtil.extractExpiration(token);
            long timeUntilExpiration = expiration.getTime() - System.currentTimeMillis();
            return timeUntilExpiration < (1 * 60 * 1000); // 1분
        } catch (Exception e) {
            log.warn("Failed to check token expiration: {}", e.getMessage());
            return true; // 만료 확인 실패시 안전하게 만료로 처리
        }
    }
}