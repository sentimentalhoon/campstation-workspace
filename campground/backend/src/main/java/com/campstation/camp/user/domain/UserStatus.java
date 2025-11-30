package com.campstation.camp.user.domain;

/**
 * 사용자 상태 enum
 */
public enum UserStatus {
    /**
     * 활성 상태 - 정상적인 서비스 이용 가능
     */
    ACTIVE,

    /**
     * 비활성 상태 - 일시적으로 계정 비활성화
     */
    INACTIVE,

    /**
     * 잠금 상태 - 보안상 이유로 계정 잠금
     */
    LOCKED,

    /**
     * 탈퇴 상태 - 회원 탈퇴
     */
    WITHDRAWN
}