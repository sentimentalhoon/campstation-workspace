package com.campstation.camp.user.domain;

/**
 * 사용자 역할 enum
 */
public enum UserRole {
    /**
     * 일반 사용자 - 캠핑장 예약 및 리뷰 작성 가능
     */
    USER,

    /**
     * 캠핑장 소유자 - 자신의 캠핑장 관리 가능
     */
    OWNER,

    /**
     * 관리자 - 모든 권한 보유
     */
    ADMIN
}