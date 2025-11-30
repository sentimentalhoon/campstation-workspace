package com.campstation.camp.shared;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import org.springframework.lang.NonNull;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;

import com.campstation.camp.shared.notification.AlertPublisher;

import io.micrometer.observation.Observation;
import io.micrometer.observation.ObservationRegistry;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * API 요청 로깅 인터셉터
 * 모든 API 요청을 로깅하여 보안 모니터링 및 감사 추적
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class RequestLoggingInterceptor implements HandlerInterceptor {

    private final MetricsService metricsService;
    private final AlertPublisher alertPublisher;
    private final ObservationRegistry observationRegistry;

    private static final DateTimeFormatter TIMESTAMP_FORMAT =
        DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSS");

    @Override
    public boolean preHandle(@NonNull HttpServletRequest request,
                             @NonNull HttpServletResponse response,
                             @NonNull Object handler) {
        String timestamp = LocalDateTime.now().format(TIMESTAMP_FORMAT);
        String method = request.getMethod();
        String uri = request.getRequestURI();
        String queryString = request.getQueryString();
        String clientIp = getClientIpAddress(request);
        String userAgent = request.getHeader("User-Agent");

        // 전체 요청 URL 구성
        String fullUrl = queryString != null ? uri + "?" + queryString : uri;

        // 인증 정보 확인
        String authHeader = request.getHeader("Authorization");
        String authType = "NONE";
        if (authHeader != null) {
            if (authHeader.startsWith("Bearer ")) {
                authType = "JWT";
            } else if (authHeader.startsWith("Basic ")) {
                authType = "BASIC";
            } else {
                authType = "UNKNOWN";
            }
        }

        // 보안 관련 헤더 로깅
        String contentType = request.getHeader("Content-Type");
        String accept = request.getHeader("Accept");
        String origin = request.getHeader("Origin");
        String referer = request.getHeader("Referer");

        log.info("[{}] {} {} - IP: {}, Auth: {}, User-Agent: {}",
                timestamp, method, fullUrl, clientIp, authType,
                userAgent != null ? userAgent.substring(0, Math.min(userAgent.length(), 100)) : "null");

        // 상세 로깅 (디버그 모드)
        if (log.isDebugEnabled()) {
            log.debug("Request Details - Content-Type: {}, Accept: {}, Origin: {}, Referer: {}",
                    contentType, accept, origin, referer);
        }

        // 요청 시작 시간 저장 (성능 모니터링용)
    request.setAttribute("startTime", System.currentTimeMillis());
    Observation observation = Observation.start("http.server.request.campstation", observationRegistry)
        .lowCardinalityKeyValue("method", method)
        .lowCardinalityKeyValue("uri", uri);
    request.setAttribute("observation", observation);

        return true;
    }

    @Override
    public void postHandle(@NonNull HttpServletRequest request,
                           @NonNull HttpServletResponse response,
                           @NonNull Object handler,
                           @Nullable ModelAndView modelAndView) {
        // 응답 처리 후 로깅 (필요시)
    }

    @Override
    public void afterCompletion(@NonNull HttpServletRequest request,
                                @NonNull HttpServletResponse response,
                                @NonNull Object handler,
                                @Nullable Exception ex) {
    long startTime = (Long) request.getAttribute("startTime");
    long duration = System.currentTimeMillis() - startTime;
    Observation observation = (Observation) request.getAttribute("observation");

        String method = request.getMethod();
        String uri = request.getRequestURI();
        int statusCode = response.getStatus();
        String clientIp = getClientIpAddress(request);

        // 응답 상태에 따른 로깅 레벨 결정
        if (statusCode >= 400) {
            log.warn("[RESPONSE] {} {} -> {} ({}ms) - IP: {}",
                    method, uri, statusCode, duration, clientIp);
        } else if (duration > 5000) { // 5초 이상 걸리는 요청
            log.warn("[SLOW RESPONSE] {} {} -> {} ({}ms) - IP: {}",
                    method, uri, statusCode, duration, clientIp);
            alertPublisher.publishPerformanceAlert(uri, duration);
        } else {
            log.info("[RESPONSE] {} {} -> {} ({}ms) - IP: {}",
                    method, uri, statusCode, duration, clientIp);
        }

        // 예외 발생시 로깅
        if (ex != null) {
            log.error("[EXCEPTION] {} {} - Exception: {} - IP: {}",
                    method, uri, ex.getMessage(), clientIp, ex);
            alertPublisher.publishSystemAlert("Application Exception", ex.getMessage() + " at " + uri);
        }

        // API 성능 메트릭 기록
        metricsService.recordApiResponseTime(uri, method, duration);
        metricsService.recordApiStatusCode(uri, method, statusCode);

        if (observation != null) {
            observation.highCardinalityKeyValue("status", String.valueOf(statusCode));
            observation.stop();
        }
    }

    /**
     * 클라이언트 IP 주소 추출 (프록시 고려)
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }

        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }

        return request.getRemoteAddr();
    }
}