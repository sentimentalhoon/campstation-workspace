package com.campstation.camp.shared;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import com.campstation.camp.auth.service.JwtTokenService;
import com.campstation.camp.shared.config.CookieConfig;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * OAuth2 로그인 성공 핸들러
 * JWT 토큰을 HttpOnly 쿠키로 설정하여 보안 강화
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtUtil jwtUtil;
    private final JwtTokenService jwtTokenService;
    private final CookieConfig cookieConfig;

    @Value("${frontend.url:http://localhost:3000}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                      Authentication authentication) throws IOException, ServletException {

        if (response.isCommitted()) {
            log.debug("응답이 이미 커밋되었습니다. 리다이렉트할 수 없습니다.");
            return;
        }

        CustomOAuth2User oauth2User = (CustomOAuth2User) authentication.getPrincipal();
        String email = oauth2User.getEmail();

        // JWT Access Token 및 Refresh Token 생성
        String accessToken = jwtUtil.generateAccessToken(oauth2User.getUser());
        String refreshToken = jwtUtil.generateRefreshToken(oauth2User.getUser());

        // Redis에 Access Token 저장 (TTL: 2시간)
        try {
            jwtTokenService.saveToken(oauth2User.getUser().getUsername(), accessToken, cookieConfig.getJwtExpirationMs() / 1000);
        } catch (Exception e) {
            log.warn("Failed to save token to Redis, but continuing OAuth2 login: {}", e.getMessage());
        }

        // 쿠키 설정
        response.addHeader(HttpHeaders.SET_COOKIE, cookieConfig.createAccessTokenCookie(accessToken).toString());
        response.addHeader(HttpHeaders.SET_COOKIE, cookieConfig.createRefreshTokenCookie(refreshToken).toString());

        // 프론트엔드로 리다이렉트 (토큰은 쿠키에 있으므로 URL에 포함하지 않음)
        String targetUrl = UriComponentsBuilder.fromUriString(frontendUrl + "/auth/callback")
                .queryParam("success", "true")
                .build().toUriString();

        log.info("OAuth2 로그인 성공: {} - 토큰을 HttpOnly 쿠키로 설정", email);
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
