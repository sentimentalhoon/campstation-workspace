package com.campstation.camp.shared.notification;

import java.util.Map;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;

/**
 * 도메인 이벤트 기반으로 시스템 알림을 발행하는 퍼블리셔.
 * 호출 지점에서는 구현체(메일, 슬랙 등)를 몰라도 되며 알림 카테고리와 데이터를 전달하면 됩니다.
 */
@Component
@RequiredArgsConstructor
public class AlertPublisher {

    private final ApplicationEventPublisher eventPublisher;

    public void publishPerformanceAlert(String uri, long durationMs) {
        publish(AlertCategory.PERFORMANCE,
                "API Performance Alert",
                "응답 시간이 임계치를 초과했습니다.",
                Map.of("uri", uri, "durationMs", durationMs));
    }

    public void publishSystemAlert(String title, String message) {
        publish(AlertCategory.SYSTEM, title, message, Map.of());
    }

    public void publishHealthAlert(String component, String errorMessage) {
        publish(AlertCategory.HEALTH,
                component + " Health Check Failed",
                errorMessage,
                Map.of("component", component));
    }

    public void publish(AlertCategory category, String title, String message, Map<String, Object> attributes) {
        eventPublisher.publishEvent(new AlertEvent(category, title, message, attributes));
    }
}
