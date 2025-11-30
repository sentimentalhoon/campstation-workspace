package com.campstation.camp.shared.security;

import com.campstation.camp.user.domain.User;

/**
 * 소유자 정보를 가진 리소스를 나타내는 인터페이스
 * 
 * 이 인터페이스를 구현하는 엔티티는 SecurityUtils를 통해
 * 소유자 검증을 할 수 있습니다.
 */
public interface Ownable {
    
    /**
     * 리소스의 소유자를 반환
     * 
     * @return 리소스 소유자
     */
    User getOwner();
}
