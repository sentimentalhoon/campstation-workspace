package com.campstation.camp.shared.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import com.campstation.camp.shared.RequestLoggingInterceptor;
import com.campstation.camp.shared.ratelimit.RateLimitInterceptor;

import lombok.RequiredArgsConstructor;
@Configuration
@RequiredArgsConstructor
public class WebConfig implements WebMvcConfigurer {

    private final RequestLoggingInterceptor requestLoggingInterceptor;
    private final RateLimitInterceptor rateLimitInterceptor;

    @Override
    public void addCorsMappings(@NonNull CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOriginPatterns("http://localhost:*") // 개발 환경용
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }

    @Override
    public void addInterceptors(@NonNull InterceptorRegistry registry) {
        // Rate Limit Interceptor (최우선 적용)
        registry.addInterceptor(rateLimitInterceptor)
                .addPathPatterns("/api/**")
                .excludePathPatterns("/api/actuator/**", "/actuator/**")
                .order(1); // 최우선 순위

        // Request Logging Interceptor
        registry.addInterceptor(requestLoggingInterceptor)
                .addPathPatterns("/api/**") // API 경로에만 적용
                .excludePathPatterns("/api/actuator/**") // 액추에이터 제외
                .order(2); // 두 번째 순위
    }

    @Override
    public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {
        // H2 콘솔 정적 리소스 핸들러 추가 (Spring Boot 3.x용)
        registry.addResourceHandler("/h2-console/**")
                .addResourceLocations("classpath:/META-INF/resources/webjars/h2/");
    }
}