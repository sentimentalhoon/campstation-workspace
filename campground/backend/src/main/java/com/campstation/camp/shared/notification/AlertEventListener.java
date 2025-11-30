package com.campstation.camp.shared.notification;

import java.util.Map;

import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * AlertEvent를 구독하여 실제 알림 채널로 전달합니다. 기본 구현은 이메일 전송입니다.
 * 이벤트 기반으로 비동기 처리되어 웹 요청 흐름을 차단하지 않습니다.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AlertEventListener {

    private final EmailNotificationService emailNotificationService;

    @Async
    @EventListener
    public void onAlert(AlertEvent event) {
        log.debug("Processing alert event: {} - {}", event.category(), event.title());
        switch (event.category()) {
            case PERFORMANCE -> handlePerformance(event.attributes());
            case HEALTH -> handleHealth(event.attributes(), event.message());
            case SYSTEM, SECURITY -> emailNotificationService.sendSystemAlert(event.title(), event.message());
            default -> log.info("Unhandled alert category: {}", event.category());
        }
    }

    private void handlePerformance(Map<String, Object> attributes) {
        String uri = (String) attributes.getOrDefault("uri", "unknown");
        long duration = ((Number) attributes.getOrDefault("durationMs", 0L)).longValue();
        emailNotificationService.sendPerformanceAlert(uri, duration);
    }

    private void handleHealth(Map<String, Object> attributes, String errorMessage) {
        String component = (String) attributes.getOrDefault("component", "unknown");
        emailNotificationService.sendHealthCheckAlert(component, errorMessage);
    }
}
