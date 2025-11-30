package com.campstation.camp.shared.notification;

import java.time.Instant;
import java.util.Map;

/**
 * 시스템 전역 알림을 비동기적으로 발행하기 위한 도메인 이벤트입니다.
 * email, slack 등 다양한 채널로 전달될 수 있도록 카테고리와 메타 정보를 포함합니다.
 */
public record AlertEvent(
        AlertCategory category,
        String title,
        String message,
        Map<String, Object> attributes,
        Instant occurredAt
) {
    public AlertEvent(AlertCategory category, String title, String message, Map<String, Object> attributes) {
        this(category, title, message, attributes, Instant.now());
    }
}
