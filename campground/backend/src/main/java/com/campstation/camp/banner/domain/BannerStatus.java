package com.campstation.camp.banner.domain;

/**
 * 배너 활성화 상태
 */
public enum BannerStatus {
    ACTIVE,         // 활성화 (현재 표시 중)
    INACTIVE,       // 비활성화 (숨김)
    SCHEDULED       // 예약됨 (시작 시간 대기 중)
}
