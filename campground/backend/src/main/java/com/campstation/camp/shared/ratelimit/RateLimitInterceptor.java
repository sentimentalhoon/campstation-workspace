package com.campstation.camp.shared.ratelimit;

import io.github.bucket4j.Bucket;
import io.github.bucket4j.ConsumptionProbe;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.lang.NonNull;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * Rate Limiting Interceptor
 *
 * Intercepts HTTP requests and applies rate limiting based on:
 * - Endpoint type (auth, payment, general API)
 * - User identity (user ID or IP address)
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class RateLimitInterceptor implements HandlerInterceptor {

    private final RateLimitConfig rateLimitConfig;

    @Override
    public boolean preHandle(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull Object handler
    ) throws Exception {
        String path = request.getRequestURI();
        String key = getClientKey(request);

        Bucket bucket = selectBucket(path, key);
        ConsumptionProbe probe = bucket.tryConsumeAndReturnRemaining(1);

        if (probe.isConsumed()) {
            // Request allowed
            response.addHeader("X-Rate-Limit-Remaining", String.valueOf(probe.getRemainingTokens()));
            return true;
        } else {
            // Rate limit exceeded
            long waitForRefill = probe.getNanosToWaitForRefill() / 1_000_000_000;

            log.warn("Rate limit exceeded for key: {}, path: {}", key, path);

            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.addHeader("X-Rate-Limit-Retry-After-Seconds", String.valueOf(waitForRefill));
            response.setContentType("application/json");
            response.getWriter().write(String.format(
                "{\"error\":\"Too many requests\",\"message\":\"Rate limit exceeded. Please retry after %d seconds.\"}",
                waitForRefill
            ));

            return false;
        }
    }

    /**
     * Select appropriate bucket based on endpoint path
     */
    private Bucket selectBucket(String path, String key) {
        if (path.contains("/auth/") || path.contains("/login") || path.contains("/register")) {
            return rateLimitConfig.resolveAuthBucket(key);
        } else if (path.contains("/payment")) {
            return rateLimitConfig.resolvePaymentBucket(key);
        } else {
            return rateLimitConfig.resolveApiBucket(key);
        }
    }

    /**
     * Get client key for rate limiting
     * Prefers user ID (if authenticated), falls back to IP address
     */
    private String getClientKey(HttpServletRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication != null && authentication.isAuthenticated()
                && !"anonymousUser".equals(authentication.getPrincipal())) {
            return "user:" + authentication.getName();
        }

        // Fall back to IP address for unauthenticated requests
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty()) {
            ip = request.getRemoteAddr();
        } else {
            // X-Forwarded-For can contain multiple IPs, take the first one
            ip = ip.split(",")[0].trim();
        }

        return "ip:" + ip;
    }
}
